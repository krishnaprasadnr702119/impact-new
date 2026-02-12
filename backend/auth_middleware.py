"""
Authentication middleware and decorators for JWT token-based authentication
"""

import os
import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
from models import User, db

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_HOURS', 8)))
JWT_REFRESH_TOKEN_EXPIRES = datetime.timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES_DAYS', 30)))

class AuthError(Exception):
    """Custom authentication error"""
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

def generate_tokens(user):
    """Generate access and refresh tokens for a user"""
    from models import Organization
    
    # Get organization name if user has org_id
    org_name = None
    if user.org_id:
        org = Organization.query.get(user.org_id)
        if org:
            org_name = org.name
    
    # Access token payload
    access_payload = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'email': user.email,
        'org_id': user.org_id,
        'org_name': org_name,
        'token_type': 'access',
        'exp': datetime.datetime.utcnow() + JWT_ACCESS_TOKEN_EXPIRES,
        'iat': datetime.datetime.utcnow()
    }
    
    # Refresh token payload
    refresh_payload = {
        'user_id': user.id,
        'username': user.username,
        'token_type': 'refresh',
        'exp': datetime.datetime.utcnow() + JWT_REFRESH_TOKEN_EXPIRES,
        'iat': datetime.datetime.utcnow()
    }
    
    access_token = jwt.encode(access_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    return access_token, refresh_token

def decode_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthError('Token has expired', 401)
    except jwt.InvalidTokenError:
        raise AuthError('Invalid token', 401)

def get_token_from_header():
    """Extract token from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise AuthError('Authorization header is missing', 401)
    
    try:
        token_type, token = auth_header.split(' ')
        if token_type.lower() != 'bearer':
            raise AuthError('Invalid token type. Expected Bearer token', 401)
        return token
    except ValueError:
        raise AuthError('Invalid Authorization header format', 401)

def get_current_user():
    """Get current user from JWT token"""
    try:
        token = get_token_from_header()
        payload = decode_token(token)
        
        # Verify token type
        if payload.get('token_type') != 'access':
            raise AuthError('Invalid token type', 401)
        
        # Get user from database
        user = User.query.get(payload['user_id'])
        if not user:
            raise AuthError('User not found', 401)
        
        return user, payload
    except AuthError:
        raise
    except Exception as e:
        raise AuthError(f'Authentication failed: {str(e)}', 401)

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user, payload = get_current_user()
            # Add user and payload to request context
            request.current_user = user
            request.token_payload = payload
            return f(*args, **kwargs)
        except AuthError as e:
            return jsonify({'error': e.error}), e.status_code
        except Exception as e:
            return jsonify({'error': 'Authentication failed'}), 401
    return decorated

def role_required(*allowed_roles):
    """Decorator to require specific role(s)"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            try:
                user, payload = get_current_user()
                
                if user.role not in allowed_roles:
                    return jsonify({
                        'error': f'Access denied. Required role(s): {", ".join(allowed_roles)}',
                        'current_role': user.role
                    }), 403
                
                # Add user and payload to request context
                request.current_user = user
                request.token_payload = payload
                return f(*args, **kwargs)
            except AuthError as e:
                return jsonify({'error': e.error}), e.status_code
            except Exception as e:
                return jsonify({'error': 'Authentication failed'}), 401
        return decorated
    return decorator

def optional_token(f):
    """Decorator for endpoints where token is optional"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user, payload = get_current_user()
            request.current_user = user
            request.token_payload = payload
        except:
            # Token is optional, so we don't raise errors
            request.current_user = None
            request.token_payload = None
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to require admin role"""
    return role_required('admin')(f)

def portal_admin_required(f):
    """Decorator to require portal admin role"""
    return role_required('portal_admin')(f)

def employee_required(f):
    """Decorator to require employee role"""
    return role_required('employee')(f)

def admin_or_portal_admin_required(f):
    """Decorator to require admin or portal admin role"""
    return role_required('admin', 'portal_admin')(f)

def validate_organization_access(f):
    """Decorator to validate user has access to organization data"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user, payload = get_current_user()
            
            # Admin has access to all organizations
            if user.role == 'admin':
                request.current_user = user
                request.token_payload = payload
                return f(*args, **kwargs)
            
            # Portal admin can only access their own organization
            if user.role == 'portal_admin':
                if not user.org_id:
                    return jsonify({'error': 'User not associated with any organization'}), 403
                
                # Check if trying to access different organization
                org_id = request.view_args.get('org_id') or request.json.get('org_id') if request.json else None
                if org_id and int(org_id) != user.org_id:
                    return jsonify({'error': 'Access denied to this organization'}), 403
            
            # Employee can only access their own organization's data
            if user.role == 'employee':
                if not user.org_id:
                    return jsonify({'error': 'User not associated with any organization'}), 403
            
            request.current_user = user
            request.token_payload = payload
            return f(*args, **kwargs)
            
        except AuthError as e:
            return jsonify({'error': e.error}), e.status_code
        except Exception as e:
            return jsonify({'error': 'Authentication failed'}), 401
    return decorated
