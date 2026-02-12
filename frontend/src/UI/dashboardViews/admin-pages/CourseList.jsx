import React, { useEffect, useState, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaVideo, FaFilePdf, FaQuestionCircle, FaChevronLeft, FaRegCheckCircle, FaCogs } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';
import NoDataDisplay from '../../components/NoDataDisplay';
import QuizManager from "../../components/Quiz/QuizManager";
import ConfirmDialog from '../../components/ConfirmDialog';
import AlertDialog from '../../components/AlertDialog';
// CourseListItem Component
const CourseListItem = ({ course, selectedCourse, onCourseClick, onEdit, onDelete, deleteLoading }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#16a34a';
      case 'draft': return '#b45309';
      case 'archived': return '#64748b';
      default: return '#64748b';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'published': return '#dcfce7';
      case 'draft': return '#fef3c7';
      case 'archived': return '#f1f5f9';
      default: return '#f1f5f9';
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: selectedCourse === course.id
          ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: selectedCourse === course.id
          ? '2px solid #3b82f6'
          : '1px solid rgba(226,232,240,0.6)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: selectedCourse === course.id
          ? '0 20px 25px -5px rgba(59,130,246,0.1), 0 10px 10px -5px rgba(59,130,246,0.04)'
          : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => onCourseClick(course)}
      onMouseEnter={(e) => {
        if (selectedCourse !== course.id) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (selectedCourse !== course.id) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
        }
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        width: '40px',
        height: '40px',
        background: selectedCourse === course.id
          ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
          : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
        borderRadius: '50%',
        opacity: 0.7,
      }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{
          fontWeight: 700,
          color: selectedCourse === course.id ? '#1d4ed8' : '#1e40af',
          fontSize: '16px',
          lineHeight: '1.3',
          maxWidth: '70%'
        }}>
          {course.title}
        </div>
        <div style={{
          padding: '6px 14px',
          borderRadius: '50px',
          fontSize: '12px',
          fontWeight: 700,
          background: getStatusBgColor(course.status),
          color: getStatusColor(course.status),
          border: `1px solid ${getStatusColor(course.status)}20`,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{
          color: '#64748b',
          fontSize: '12px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            filter: 'grayscale(0.3)'
          }}>📚</span>
          {course.module_count} module{course.module_count !== 1 ? 's' : ''}
        </h3>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              color: '#475569',
              border: '1px solid rgba(71,85,105,0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FaEdit size={12} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course.id);
            }}
            disabled={deleteLoading === course.id}
            style={{
              background: deleteLoading === course.id
                ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
                : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              color: deleteLoading === course.id ? '#94a3b8' : '#dc2626',
              border: deleteLoading === course.id
                ? '1px solid rgba(148,163,184,0.3)'
                : '1px solid rgba(220,38,38,0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: deleteLoading === course.id ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!deleteLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleteLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <FaTrash size={14} />
            {deleteLoading === course.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {selectedCourse === course.id && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px',
          padding: '12px',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '8px',
          color: '#1d4ed8',
          fontWeight: 700,
          fontSize: '12px',
          border: '1px solid rgba(29,78,216,0.2)',
          animation: 'pulse 2s infinite',
        }}>
          <FaChevronLeft size={16} style={{ marginRight: '8px' }} />
          Click to Hide Course Details
        </div>
      )}
    </div>
  );
};

// CourseList Component (Left Panel)
const CourseListPanel = ({ courses, filteredCourses, loading, error, selectedCourse, onCourseClick, onEditCourse, onDelete, deleteLoading, searchTerm, onSearchChange, onSearchClear }) => {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 16px rgba(102,126,234,0.08)',
        overflow: 'auto',
        width: '40%',
        minWidth: 300,
        height: '100%',
      }}
    >
      {loading ? (
        <Loader />
      ) : error ? (
        <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 18, padding: 32 }}>Failed to load courses: {error}</div>
      ) : filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>No courses yet</div>
          <div>Click "Create Course" to add your first course</div>
        </div>
      ) : (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredCourses.map((course) => (
            <CourseListItem
              key={course.id}
              course={course}
              selectedCourse={selectedCourse}
              onCourseClick={onCourseClick}
              onEdit={onEditCourse}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ContentItem Component
const ContentItem = ({ content, onView, onEditQuiz, onDelete }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'video': return <FaVideo />;
      case 'pdf': return <FaFilePdf />;
      case 'quiz': return <FaQuestionCircle />;
      case 'simulation': return <FaCogs />;
      default: return null;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'video': return { color: '#ef4444', bg: '#fee2e2' };
      case 'pdf': return { color: '#2563eb', bg: '#dbeafe' };
      case 'quiz': return { color: '#7c3aed', bg: '#ede9fe' };
      case 'simulation': return { color: '#10b981', bg: '#d1fae5' };
      default: return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const colors = getColors(content.content_type);

  return (
    <div
      style={{
        padding: 12,
        marginBottom: 10,
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}
    >
      <div style={{ color: colors.color, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: colors.bg, borderRadius: 8 }}>
        {getIcon(content.content_type)}
      </div>
      <div style={{ flexGrow: 1 }}>
        <div style={{ fontWeight: 600, color: '#334155' }}>{content.title}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
          {content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button
          style={{
            background: '#e0f2fe',
            color: '#0891b2',
            border: 'none',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => {
            onView(content)
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#0891b2';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#e0f2fe';
            e.currentTarget.style.color = '#0891b2';
          }}
        >
          View
        </button>

        {content.content_type === 'quiz' && (
          <button
            style={{
              background: '#fef3c7',
              color: '#d97706',
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => onEditQuiz(content)}
            onMouseOver={e => {
              e.currentTarget.style.background = '#d97706';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#fef3c7';
              e.currentTarget.style.color = '#d97706';
            }}
          >
            <FaEdit style={{ marginRight: '4px' }} />
            Edit Quiz
          </button>
        )}

        <button
          style={{
            background: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => onDelete(content.id)}
          onMouseOver={e => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#fee2e2';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          <FaTrash style={{ marginRight: '4px' }} />
          Delete
        </button>
      </div>
    </div>
  );
};

// Module Component
const Module = ({ module, onAddContent, onEditModule, onViewContent, onEditQuiz, onDeleteContent }) => {
  return (
    <div
      style={{
        marginBottom: 16,
        background: '#f8fafc',
        borderRadius: 10,
        overflow: 'hidden'
      }}
    >
      <div style={{
        padding: '14px 18px',
        background: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontWeight: 600, color: '#334155', fontSize: 16 }}>
            {module.title}
          </div>
          {module.description && (
            <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
              {module.description}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#4ade80',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
            onClick={() => onAddContent(module)}
          >
            <FaPlus size={10} />
            Add Content
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#e2e8f0',
              color: '#475569',
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
            onClick={() => onEditModule(module)}
          >
            <FaEdit size={10} />
            Edit
          </button>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {module.contents.length === 0 ? (
          <div style={{ color: '#94a3b8', padding: 12, textAlign: 'center', fontSize: 14 }}>
            No content yet. Add videos, documents, or quizzes.
          </div>
        ) : (
          <div>
            {module.contents.map((content) => (
              <ContentItem
                key={content.id}
                content={content}
                onView={onViewContent}
                onEditQuiz={onEditQuiz}
                onDelete={onDeleteContent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// CourseDetails Component (Right Panel)
const CourseDetails = ({ course, selectedCourse, courseLoading, onAddModule, onAddContent, onViewContent, onEditQuiz, onDeleteContent, onEditModule }) => {
  if (!selectedCourse) {
    return (
      <NoDataDisplay icon={'👆'} message={'Select a Course'} desc={'Choose a course from the list to view details'}></NoDataDisplay>
    );
  }

  if (courseLoading) {
    return (
      <div style={{ padding: '40px' }}>
        <Loader />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{
        color: '#ef4444',
        fontWeight: 600,
        fontSize: '18px',
        padding: '40px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          Failed to load course details
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', height: '100%', overflow: 'auto' }}>
      <div style={{
        marginBottom: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(59,130,246,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '50%',
          opacity: 0.1
        }}></div>

        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '20px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.2
        }}>
          {course.title}
        </h3>
        <div style={{
          color: '#64748b',
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: 1.5
        }}>
          {course.description || 'No description provided'}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: '12px 16px',
        background: '#f8fafc',
        borderRadius: 10,
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: 600, color: '#334155' }}>Course Modules</div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
          onClick={onAddModule}
        >
          <FaPlus size={12} />
          Add Module
        </button>
      </div>

      {course.modules.length === 0 ? (
        <div style={{
          padding: 30,
          background: '#f8fafc',
          borderRadius: 10,
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No modules yet</div>
          <div>Add your first module to this course</div>
        </div>
      ) : (
        <div>
          {course.modules.map((module) => (
            <Module
              key={module.id}
              module={module}
              onAddContent={onAddContent}
              onEditModule={onEditModule}
              onViewContent={onViewContent}
              onEditQuiz={onEditQuiz}
              onDeleteContent={onDeleteContent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// FormModal Component (Generic Modal Wrapper)
const FormModal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15,23,42,0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {children}
    </div>
  );
};

// CourseForm Component (For Create/Edit)
const CourseForm = ({ form, onInputChange, onSubmit, error, submitting, title, isEdit = false, onClose }) => {
  return (
    <form onSubmit={onSubmit} style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      padding: 36,
      minWidth: 360,
      maxWidth: '90vw',
      width: 420,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      position: 'relative',
      animation: 'slideUp 0.3s ease-out',
      border: '1px solid rgba(226,232,240,0.8)',
    }}>
      <h3 style={{
        margin: 0,
        color: '#1e40af',
        fontWeight: 800,
        fontSize: 24,
        position: 'relative',
        paddingBottom: 14,
        marginBottom: 5
      }}>
        {title}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 40,
          height: 4,
          background: 'linear-gradient(90deg, #3b82f6, #1e40af)',
          borderRadius: 2
        }}></div>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Course Title*
        </label>
        <input
          name="title"
          value={form.title}
          onChange={onInputChange}
          required
          placeholder="Enter course title"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#93c5fd';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={onInputChange}
          placeholder="Enter course description"
          rows={4}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none',
            resize: 'vertical'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#93c5fd';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Status*
        </label>
        <select
          name="status"
          value={form.status}
          onChange={onInputChange}
          required
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            cursor: 'pointer'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#93c5fd';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {error && (
        <div style={{
          color: '#ef4444',
          fontWeight: 600,
          background: '#fee2e2',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#475569',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 15,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
            fontSize: 15,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            if (!submitting) {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {submitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Course' : 'Create Course')}
        </button>
      </div>
    </form>
  );
};

// ModuleForm Component
const ModuleForm = ({ form, onInputChange, onSubmit, error, submitting, onClose, isEditing = false }) => {
  return (
    <form onSubmit={onSubmit} style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      padding: 36,
      minWidth: 360,
      maxWidth: '90vw',
      width: 420,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      position: 'relative',
      animation: 'slideUp 0.3s ease-out',
      border: '1px solid rgba(226,232,240,0.8)',
    }}>
      <h3 style={{
        margin: 0,
        color: '#1e40af',
        fontWeight: 800,
        fontSize: 24,
        position: 'relative',
        paddingBottom: 14,
        marginBottom: 5
      }}>
        {isEditing ? 'Edit Module' : 'Add Module to Course'}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 40,
          height: 4,
          background: 'linear-gradient(90deg, #3b82f6, #1e40af)',
          borderRadius: 2
        }}></div>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Module Title*
        </label>
        <input
          name="title"
          value={form.title}
          onChange={onInputChange}
          required
          placeholder="Enter module title"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#93c5fd';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={onInputChange}
          placeholder="Enter module description"
          rows={3}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none',
            resize: 'vertical'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#93c5fd';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      {error && (
        <div style={{
          color: '#ef4444',
          fontWeight: 600,
          background: '#fee2e2',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#475569',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 15,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
            fontSize: 15,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            if (!submitting) {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {submitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Module' : 'Add Module')}
        </button>
      </div>
    </form>
  );
};

// ContentTypeSelector Component
const ContentTypeSelector = ({ contentType, onChange }) => {
  const types = [
    { id: 'video', label: 'Video', icon: FaVideo, color: '#ef4444', bgColor: '#fee2e2' },
    { id: 'pdf', label: 'PDF Document', icon: FaFilePdf, color: '#2563eb', bgColor: '#dbeafe' },
    { id: 'quiz', label: 'Quiz', icon: FaQuestionCircle, color: '#7c3aed', bgColor: '#ede9fe' },
    { id: 'simulation', label: 'Simulation', icon: FaCogs, color: '#10b981', bgColor: '#d1fae5' }
  ];

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {types.map(type => (
        <label
          key={type.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            padding: '12px 8px',
            border: `2px solid ${contentType === type.id ? type.color : '#e2e8f0'}`,
            borderRadius: 10,
            background: contentType === type.id ? type.bgColor : '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <input
            type="radio"
            name="content_type"
            value={type.id}
            checked={contentType === type.id}
            onChange={onChange}
            style={{ display: 'none' }}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            background: type.bgColor,
            borderRadius: 10,
            color: type.color
          }}>
            <type.icon size={18} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', textAlign: 'center' }}>{type.label}</div>
        </label>
      ))}
    </div>
  );
};

// Simulation Builder Component  
const SimulationBuilder = ({ simulationData, setSimulationData, currentStep, setCurrentStep }) => {
  const [showStepForm, setShowStepForm] = useState(false);

  const addOption = () => {
    setCurrentStep({
      ...currentStep,
      options: [...currentStep.options, { id: '', text: '' }]
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...currentStep.options];
    newOptions[index][field] = value;
    setCurrentStep({ ...currentStep, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = currentStep.options.filter((_, i) => i !== index);
    setCurrentStep({ ...currentStep, options: newOptions });
  };

  const toggleCorrectAnswer = (optionId) => {
    const correct = currentStep.correct_answers || [];
    if (correct.includes(optionId)) {
      setCurrentStep({
        ...currentStep,
        correct_answers: correct.filter(id => id !== optionId)
      });
    } else {
      setCurrentStep({
        ...currentStep,
        correct_answers: [...correct, optionId]
      });
    }
  };

  const addStepToSimulation = () => {
    if (!currentStep.title || currentStep.options.length === 0) {
      setAlertDialog({ isOpen: true, title: 'Missing Information', message: 'Please fill in step title and at least one option', type: 'warning' });
      return;
    }

    setSimulationData({
      ...simulationData,
      steps: [...simulationData.steps, { ...currentStep }]
    });

    setCurrentStep({
      title: '',
      description: '',
      options: [{ id: '', text: '' }],
      correct_answers: [],
      feedback_correct: '',
      feedback_incorrect: ''
    });
    setShowStepForm(false);
  };

  const removeStep = (index) => {
    setSimulationData({
      ...simulationData,
      steps: simulationData.steps.filter((_, i) => i !== index)
    });
  };

  return (
    <div style={{ border: '2px solid #3b82f6', borderRadius: 12, padding: 20, background: '#eff6ff', marginTop: 16 }}>
      <h3 style={{ marginTop: 0, color: '#1e40af', fontSize: 16, marginBottom: 16 }}>Simulation Configuration</h3>

      {/* Email Content */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h4 style={{ marginTop: 0, fontSize: 14, color: '#334155', marginBottom: 12 }}>Email Content</h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#475569' }}>From</label>
            <input
              type="text"
              value={simulationData.email_from}
              onChange={(e) => setSimulationData({ ...simulationData, email_from: e.target.value })}
              placeholder="e.g., it-support@compny-help.com"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 13
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Subject</label>
            <input
              type="text"
              value={simulationData.email_subject}
              onChange={(e) => setSimulationData({ ...simulationData, email_subject: e.target.value })}
              placeholder="e.g., URGENT: Verify Your Account Now!"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 13
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Body</label>
          <textarea
            value={simulationData.email_body}
            onChange={(e) => setSimulationData({ ...simulationData, email_body: e.target.value })}
            placeholder="Enter the email body..."
            rows="4"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 14,
              fontFamily: 'monospace'
            }}
          />
        </div>
      </div>

      {/* Steps List */}
      {simulationData.steps.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <h4 style={{ marginTop: 0, fontSize: 14, color: '#334155' }}>Questions/Steps ({simulationData.steps.length})</h4>
          {simulationData.steps.map((step, index) => (
            <div key={index} style={{
              background: '#f9fafb',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: 10,
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: 13 }}>
                <strong>Step {index + 1}:</strong> {step.title}
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  {step.options.length} options, {step.correct_answers?.length || 0} correct
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeStep(index)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Step Button / Form */}
      {!showStepForm ? (
        <button
          type="button"
          onClick={() => setShowStepForm(true)}
          style={{
            width: '100%',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          + Add Question/Step
        </button>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <h4 style={{ marginTop: 0, fontSize: 14, color: '#334155' }}>New Question/Step</h4>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Question Title</label>
            <input
              type="text"
              value={currentStep.title}
              onChange={(e) => setCurrentStep({ ...currentStep, title: e.target.value })}
              placeholder="e.g., Identify Red Flags"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 13
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Description</label>
            <textarea
              value={currentStep.description}
              onChange={(e) => setCurrentStep({ ...currentStep, description: e.target.value })}
              placeholder="e.g., What makes this email suspicious?"
              rows="2"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 13
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Answer Options</label>
            {currentStep.options.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <input
                  type="text"
                  value={option.id}
                  onChange={(e) => updateOption(index, 'id', e.target.value)}
                  placeholder="ID"
                  style={{
                    flex: '0 0 80px',
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    fontSize: 12
                  }}
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder="Answer text"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    fontSize: 12
                  }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={currentStep.correct_answers?.includes(option.id)}
                    onChange={() => toggleCorrectAnswer(option.id)}
                  />
                  Correct
                </label>
                {currentStep.options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      padding: '6px 8px',
                      cursor: 'pointer',
                      fontSize: 11
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
                marginTop: 4
              }}
            >
              + Add Option
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Feedback (Correct)</label>
              <textarea
                value={currentStep.feedback_correct}
                onChange={(e) => setCurrentStep({ ...currentStep, feedback_correct: e.target.value })}
                placeholder="Feedback when correct..."
                rows="2"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  fontSize: 12
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Feedback (Incorrect)</label>
              <textarea
                value={currentStep.feedback_incorrect}
                onChange={(e) => setCurrentStep({ ...currentStep, feedback_incorrect: e.target.value })}
                placeholder="Feedback when incorrect..."
                rows="2"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  fontSize: 12
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowStepForm(false)}
              style={{
                flex: 1,
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '8px',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={addStepToSimulation}
              style={{
                flex: 1,
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '8px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              Add Step
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ContentForm Component
const ContentForm = ({ form, contentFile, contentLocalUrl, onInputChange, onFileChange, onSubmit, error, submitting, selectedModule, fileInputRef, onClose, simulationData, setSimulationData, currentStep, setCurrentStep }) => {
  return (
    <form onSubmit={onSubmit} style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      padding: 36,
      minWidth: 360,
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'auto',
      width: form.content_type === 'simulation' ? 800 : 460,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      position: 'relative',
      animation: 'slideUp 0.3s ease-out',
      border: '1px solid rgba(226,232,240,0.8)',
    }}>
      <h3 style={{
        margin: 0,
        color: '#1e40af',
        fontWeight: 800,
        fontSize: 24,
        position: 'relative',
        paddingBottom: 14,
        marginBottom: 5
      }}>
        Add Content to {selectedModule?.title}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 40,
          height: 4,
          background: 'linear-gradient(90deg, #3b82f6, #1e40af)',
          borderRadius: 2
        }}></div>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Content Title*
        </label>
        <input
          name="title"
          value={form.title}
          onChange={onInputChange}
          required
          placeholder="Enter content title"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#93c5fd';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Content Type*
        </label>
        <ContentTypeSelector
          contentType={form.content_type}
          onChange={onInputChange}
        />
      </div>

      {/* Simulation Builder */}
      {form.content_type === 'simulation' && (
        <SimulationBuilder
          simulationData={simulationData}
          setSimulationData={setSimulationData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      )}

      {form.content_type !== 'quiz' && form.content_type !== 'simulation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
            {form.content_type === 'video' ? 'Video File*' : 'PDF File*'}
          </label>
          <input
            type="file"
            accept={form.content_type === 'video' ? 'video/*' : 'application/pdf'}
            onChange={onFileChange}
            ref={fileInputRef}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              fontSize: 14,
              cursor: 'pointer'
            }}
            required
          />
          <div style={{ fontSize: 13, color: '#64748b', marginTop: -4 }}>
            {form.content_type === 'video'
              ? 'Supported formats: MP4, WebM, etc. Max size: 500MB'
              : 'Supported format: PDF. Max size: 50MB'}
          </div>
        </div>
      )}

      {form.content_type !== 'quiz' && form.content_type !== 'simulation' && contentLocalUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
            Preview
          </label>
          {form.content_type === 'video' ? (
            <video
              src={contentLocalUrl || 'file:///C:/Users/Sahad/Downloads/grok-video-02b00884-be50-4e92-ac5e-994d9aed3e56.mp4'}
              controls
              style={{
                width: '100%',
                height: '200px',
                borderRadius: 10,
                objectFit: 'cover'
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : form.content_type === 'pdf' ? (
            <iframe
              src={contentLocalUrl || 'file:///C:/Users/Sahad/Downloads/test.pdf'}
              style={{
                width: '100%',
                height: '200px',
                borderRadius: 10,
                border: '1px solid #e2e8f0'
              }}
            />
          ) : null}
        </div>
      )}

      {error && (
        <div style={{
          color: '#ef4444',
          fontWeight: 600,
          background: '#fee2e2',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#475569',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 15,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
            fontSize: 15,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            if (!submitting) {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {submitting ? 'Adding...' : form.content_type === 'quiz' ? 'Continue to Quiz' : 'Add Content'}
        </button>
      </div>
    </form>
  );
};

// QuizQuestionForm Component
const QuizQuestionForm = ({ form, onInputChange, onOptionChange, onSubmit, error, submitting, onClose }) => {
  return (
    <form onSubmit={onSubmit} style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      padding: 36,
      minWidth: 400,
      maxWidth: '90vw',
      width: 500,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      position: 'relative',
      animation: 'slideUp 0.3s ease-out',
      border: '1px solid rgba(226,232,240,0.8)',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h3 style={{
        margin: 0,
        color: '#1e40af',
        fontWeight: 800,
        fontSize: 24,
        position: 'relative',
        paddingBottom: 14,
        marginBottom: 5
      }}>
        Add Question
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 40,
          height: 4,
          background: 'linear-gradient(90deg, #3b82f6, #1e40af)',
          borderRadius: 2
        }}></div>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Question Text*
        </label>
        <input
          name="question_text"
          value={form.question_text}
          onChange={onInputChange}
          required
          placeholder="Enter your question"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#93c5fd';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Question Type*
        </label>
        <select
          name="question_type"
          value={form.question_type}
          onChange={onInputChange}
          required
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            cursor: 'pointer'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#93c5fd';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        >
          <option value="multiple-choice">Multiple Choice (Multiple answers)</option>
          <option value="single-choice">Single Choice (One answer)</option>
          <option value="true-false">True/False</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Answer Options*
        </label>

        {form.question_type === 'true-false' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: form.options[0].is_correct ? '#f0fdf4' : '#fff',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                checked={form.options[0].is_correct}
                onChange={() => {
                  onOptionChange(0, 'is_correct', true);
                  onOptionChange(1, 'is_correct', false);
                  onOptionChange(0, 'option_text', 'True');
                  onOptionChange(1, 'option_text', 'False');
                }}
              />
              <span>True</span>
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: form.options[1].is_correct ? '#f0fdf4' : '#fff',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                checked={form.options[1].is_correct}
                onChange={() => {
                  onOptionChange(1, 'is_correct', true);
                  onOptionChange(0, 'is_correct', false);
                  onOptionChange(0, 'option_text', 'True');
                  onOptionChange(1, 'option_text', 'False');
                }}
              />
              <span>False</span>
            </label>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.options.map((option, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: option.is_correct ? '#f0fdf4' : '#fff'
                }}
              >
                <input
                  type={form.question_type === 'multiple-choice' ? 'checkbox' : 'radio'}
                  checked={option.is_correct}
                  onChange={e => {
                    if (form.question_type === 'single-choice') {
                      form.options.forEach((_, i) => {
                        if (i !== index) {
                          onOptionChange(i, 'is_correct', false);
                        }
                      });
                    }
                    onOptionChange(index, 'is_correct', e.target.checked);
                  }}
                />
                <input
                  type="text"
                  value={option.option_text}
                  onChange={e => onOptionChange(index, 'option_text', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 14
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 13, color: '#64748b' }}>
          {form.question_type === 'multiple-choice'
            ? 'Check all correct answers. Students must select all correct options.'
            : form.question_type === 'single-choice'
              ? 'Select the one correct answer. Students must select the correct option.'
              : 'Select whether "True" or "False" is the correct answer.'}
        </div>
      </div>

      {error && (
        <div style={{
          color: '#ef4444',
          fontWeight: 600,
          background: '#fee2e2',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#475569',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 15,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
            fontSize: 15,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            if (!submitting) {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {submitting ? 'Adding...' : 'Add Question'}
        </button>
      </div>
    </form>
  );
};

// QuizModal Component
const QuizModal = ({ quizData, onAddQuestion, onSubmit, submitting, onClose, contentTitle }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#16a34a';
      case 'draft': return '#b45309';
      case 'archived': return '#64748b';
      default: return '#64748b';
    }
  };

  return (
    <FormModal isOpen={true} onClose={onClose}>
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          padding: 36,
          minWidth: 400,
          maxWidth: '90vw',
          width: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          position: 'relative',
          animation: 'slideUp 0.3s ease-out',
          border: '1px solid rgba(226,232,240,0.8)',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        <h3 style={{
          margin: 0,
          color: '#1e40af',
          fontWeight: 800,
          fontSize: 24,
          position: 'relative',
          paddingBottom: 14,
          marginBottom: 5
        }}>
          Create Quiz: {contentTitle}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 40,
            height: 4,
            background: 'linear-gradient(90deg, #3b82f6, #1e40af)',
            borderRadius: 2
          }}></div>
        </h3>

        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            Add questions to your quiz. You need at least one question to create a quiz.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddQuestion}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#ede9fe',
            color: '#7c3aed',
            border: '1px dashed #a78bfa',
            borderRadius: 10,
            padding: '14px 20px',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            width: '100%',
            marginBottom: 20
          }}
        >
          <FaPlus size={14} />
          Add Question
        </button>

        {quizData && JSON.parse(quizData).length > 0 ? (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: 10 }}>Questions ({JSON.parse(quizData).length})</div>
            {JSON.parse(quizData).map((question, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 10,
                  marginBottom: 10,
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {index + 1}. {question.question_text}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
                  Type: {question.question_type === 'multiple-choice' ? 'Multiple Choice' :
                    question.question_type === 'single-choice' ? 'Single Choice' :
                      'True/False'}
                </div>
                <div style={{ paddingLeft: 16 }}>
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                        color: option.is_correct ? '#16a34a' : '#64748b',
                        fontWeight: option.is_correct ? 600 : 400
                      }}
                    >
                      {option.is_correct ? (
                        <FaRegCheckCircle color="#16a34a" />
                      ) : (
                        <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #cbd5e1', marginLeft: 1 }}></span>
                      )}
                      {option.option_text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', background: '#f1f5f9', borderRadius: 10 }}>
            No questions added yet. Click "Add Question" to get started.
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 15,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!quizData || JSON.parse(quizData).length === 0 || submitting}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontWeight: 700,
              cursor: (!quizData || JSON.parse(quizData).length === 0 || submitting) ? 'not-allowed' : 'pointer',
              opacity: (!quizData || JSON.parse(quizData).length === 0 || submitting) ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
              fontSize: 15,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              if (quizData && JSON.parse(quizData).length > 0 && !submitting) {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {submitting ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </FormModal>
  );
};
// QuizViewer Modal (Placeholder - implement quiz logic as needed)
const QuizViewer = ({ isOpen, content, onClose }) => {
  if (!isOpen || !content) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          minWidth: 400,
        }}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontWeight: 600, color: '#334155' }}>
            {content.title} - Quiz
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#64748b',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ color: '#64748b' }}>
            Quiz viewer implementation needed. Questions: {content.questions?.length || 0}
          </p>
          {/* Add quiz rendering logic here */}
        </div>
      </div>
    </div>
  );
};
// ContentViewer Modal
const ContentViewer = ({ isOpen, content, onClose }) => {
  if (!isOpen || !content) return null;
  console.log('Viewing content:', content);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          minWidth: 400,
        }}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontWeight: 600, color: '#334155' }}>
            {content.title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#64748b',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {content.content_type === 'video' && content.url && (
            <video
              controls
              style={{ width: '100%', maxHeight: '60vh', borderRadius: 8 }}
              src={content.url}
              onError={(e) => console.error('Video load error:', e)}
            >
              Your browser does not support the video tag.
            </video>
          )}
          {content.content_type === 'pdf' && content.url && (
            <iframe
              src={content.url}
              style={{ width: '100%', height: '60vh', border: 'none', borderRadius: 8 }}
              title={content.title}
            />
          )}
          {!content.url && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
              Content URL not available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Main CourseList Component
const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([
    {
      id: '123',
      title: 'Test one',
      status: 'completed',
      module_count: 3,
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'draft',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, courseId: null });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);

  // Module management
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: null
  });
  const [moduleSubmitting, setModuleSubmitting] = useState(false);
  const [moduleFormError, setModuleFormError] = useState('');

  // Content management
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [contentForm, setContentForm] = useState({
    title: '',
    content_type: 'video',
    order: null
  });
  const [contentFile, setContentFile] = useState(null);
  const [contentLocalUrl, setContentLocalUrl] = useState(null);
  const [contentSubmitting, setContentSubmitting] = useState(false);
  const [contentFormError, setContentFormError] = useState('');

  // Simulation-specific state
  const [simulationData, setSimulationData] = useState({
    simulation_type: 'scenario',
    description: '',
    passing_score: 70,
    time_limit: 30,
    email_from: '',
    email_subject: '',
    email_body: '',
    steps: []
  });
  const [currentStep, setCurrentStep] = useState({
    title: '',
    description: '',
    options: [{ id: '', text: '' }],
    correct_answers: [],
    feedback_correct: '',
    feedback_incorrect: ''
  });

  // Quiz management
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizData, setQuizData] = useState('');
  const [showQuizQuestionModal, setShowQuizQuestionModal] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'multiple-choice',
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionFormError, setQuestionFormError] = useState('');

  // Content viewing
  const [viewingContent, setViewingContent] = useState(null);
  const [showContentViewer, setShowContentViewer] = useState(false);
  const [showQuizViewer, setShowQuizViewer] = useState(false);
  const [showVideoViewer, setShowVideoViewer] = useState(false);
  const [viewingVideoUrl, setViewingVideoUrl] = useState(null);

  // Quiz Manager
  const [selectedContent, setSelectedContent] = useState(null);
  const [showQuizManager, setShowQuizManager] = useState(false);

  // Course editing
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'draft'
  });
  const [editFormError, setEditFormError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Refs
  const fileInputRef = useRef(null);

  const fetchCourses = () => {
    setLoading(true);
    setError(null);
    fetch('/api/courses')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(cou =>
        cou.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  // Clean up local URL on modal close
  useEffect(() => {
    return () => {
      if (contentLocalUrl) {
        URL.revokeObjectURL(contentLocalUrl);
      }
    };
  }, [contentLocalUrl]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async e => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    if (!form.title) {
      setFormError('Please fill all required fields.');
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        if (!res.ok) {
          setFormError('Server error: ' + res.status);
          setSubmitting(false);
          return;
        }
      }
      if (!res.ok) throw new Error((data && data.message) || 'Failed to create course');
      setShowModal(false);
      setForm({ title: '', description: '', status: 'draft' });
      fetchCourses();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFormChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleUpdateCourse = async e => {
    e.preventDefault();
    setEditFormError('');
    setEditSubmitting(true);

    if (!editForm.title.trim()) {
      setEditFormError('Course title is required.');
      setEditSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditCourseModal(false);
        setEditingCourse(null);
        setEditForm({ title: '', description: '', status: 'draft' });
        fetchCourses();
      } else {
        setEditFormError(data.message || 'Failed to update course');
      }
    } catch (err) {
      setEditFormError('Failed to update course');
      console.error('Error updating course:', err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditCourseModal(false);
    setEditingCourse(null);
    setEditForm({ title: '', description: '', status: 'draft' });
    setEditFormError('');
  };

  const handleModuleInputChange = e => {
    const { name, value } = e.target;
    setModuleForm(f => ({ ...f, [name]: value }));
  };

  const handleCreateModule = async e => {
    e.preventDefault();
    setModuleFormError('');
    setModuleSubmitting(true);

    if (!moduleForm.title) {
      setModuleFormError('Module title is required.');
      setModuleSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/courses/${selectedCourse}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleForm),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        if (!res.ok) {
          setModuleFormError('Server error: ' + res.status);
          setModuleSubmitting(false);
          return;
        }
      }

      if (!res.ok) throw new Error((data && data.message) || 'Failed to create module');

      setShowModuleModal(false);
      setModuleForm({ title: '', description: '', order: null });

      fetchCourseDetails(selectedCourse);
    } catch (err) {
      setModuleFormError(err.message);
    } finally {
      setModuleSubmitting(false);
    }
  };

  const handleUpdateModule = async e => {
    e.preventDefault();
    setModuleFormError('');
    setModuleSubmitting(true);

    if (!moduleForm.title) {
      setModuleFormError('Module title is required.');
      setModuleSubmitting(false);
      return;
    }

    if (!editingModule || !editingModule.id) {
      setModuleFormError('Invalid module data.');
      setModuleSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleForm),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        if (!res.ok) {
          setModuleFormError('Server error: ' + res.status);
          setModuleSubmitting(false);
          return;
        }
      }

      if (!res.ok) throw new Error((data && data.message) || 'Failed to update module');

      setShowModuleModal(false);
      setEditingModule(null);
      setModuleForm({ title: '', description: '', order: null });

      fetchCourseDetails(selectedCourse);
    } catch (err) {
      setModuleFormError(err.message);
    } finally {
      setModuleSubmitting(false);
    }
  };

  const handleContentInputChange = e => {
    const { name, value } = e.target;
    setContentForm(f => ({ ...f, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setContentFile(file);
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setContentLocalUrl(localUrl);
    } else {
      setContentLocalUrl(null);
    }
  };

  const handleCreateContent = async e => {
    e.preventDefault();
    setContentFormError('');
    setContentSubmitting(true);

    if (!contentForm.title) {
      setContentFormError('Content title is required.');
      setContentSubmitting(false);
      return;
    }

    if (contentForm.content_type !== 'quiz' && contentForm.content_type !== 'simulation' && !contentFile) {
      setContentFormError(`Please select a ${contentForm.content_type} file to upload.`);
      setContentSubmitting(false);
      return;
    }

    try {
      if (contentForm.content_type === 'quiz' || contentForm.content_type === 'simulation') {
        const formData = new FormData();
        formData.append('title', contentForm.title);
        formData.append('content_type', contentForm.content_type);
        if (contentForm.order !== null) {
          formData.append('order', contentForm.order);
        }

        const res = await fetch(`/api/modules/${selectedModule.id}/contents`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          const contentId = data.content.id;

          if (contentForm.content_type === 'quiz' && data.content && data.content.id) {
            setSelectedContent(data.content);
            setShowQuizManager(true);
            setShowContentModal(false);
            setContentForm({ title: '', content_type: 'video', order: null });
          } else if (contentForm.content_type === 'simulation') {
            // Check if simulation has steps configured
            if (simulationData.steps.length === 0) {
              setContentFormError('Please add at least one question/step to the simulation');
              setContentSubmitting(false);
              return;
            }

            // Create the full simulation with scenarios and steps
            try {
              // Create simulation
              const simRes = await fetch(`/api/contents/${contentId}/simulation`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  simulation_type: simulationData.simulation_type,
                  description: simulationData.description || contentForm.title,
                  config_data: {
                    passing_score: simulationData.passing_score,
                    time_limit: simulationData.time_limit
                  }
                })
              });

              const simData = await simRes.json();
              if (!simData.success) throw new Error(simData.message || 'Failed to create simulation');

              const simulationId = simData.simulation.id;

              // Create scenario
              const scenarioRes = await fetch(`/api/simulations/${simulationId}/scenarios`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  title: contentForm.title,
                  description: simulationData.description || 'Analyze and respond appropriately',
                  order: 1,
                  scenario_data: {
                    email_from: simulationData.email_from,
                    email_subject: simulationData.email_subject,
                    email_body: simulationData.email_body
                  }
                })
              });

              const scenarioData = await scenarioRes.json();
              if (!scenarioData.success) throw new Error(scenarioData.message || 'Failed to create scenario');

              const scenarioId = scenarioData.scenario.id;

              // Create steps
              for (let i = 0; i < simulationData.steps.length; i++) {
                const step = simulationData.steps[i];
                const stepRes = await fetch(`/api/scenarios/${scenarioId}/steps`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    title: step.title,
                    description: step.description,
                    order: i + 1,
                    step_type: 'decision',
                    step_data: {
                      type: 'multiple_choice',
                      options: step.options,
                      correct_answers: step.correct_answers
                    },
                    feedback_correct: step.feedback_correct,
                    feedback_incorrect: step.feedback_incorrect
                  })
                });

                const stepData = await stepRes.json();
                if (!stepData.success) throw new Error(`Failed to create step ${i + 1}: ${stepData.message}`);
              }

              // Reset simulation form
              setSimulationData({
                simulation_type: 'scenario',
                description: '',
                passing_score: 70,
                time_limit: 30,
                email_from: '',
                email_subject: '',
                email_body: '',
                steps: []
              });

              setAlertDialog({ isOpen: true, title: 'Success!', message: 'Simulation created successfully with ' + simulationData.steps.length + ' steps!', type: 'success' });
              setShowContentModal(false);
              setContentForm({ title: '', content_type: 'video', order: null });
            } catch (simError) {
              setContentFormError('Simulation content created but configuration failed: ' + simError.message);
              setContentSubmitting(false);
              return;
            }
          }

          fetchCourseDetails(selectedCourse);
          return;
        } else {
          setContentFormError(data.error || `Failed to create ${contentForm.content_type}`);
          setContentSubmitting(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('title', contentForm.title);
      formData.append('content_type', contentForm.content_type);
      if (contentForm.order !== null) {
        formData.append('order', contentForm.order);
      }
      // Let the backend handle URL generation based on uploaded file
      formData.append('file', contentFile);

      const res = await fetch(`/api/modules/${selectedModule.id}/contents`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload content');
      }

      setShowContentModal(false);
      setContentForm({ title: '', content_type: 'video', order: null });
      setContentFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchCourseDetails(selectedCourse);
    } catch (err) {
      setContentFormError(err.message);
    } finally {
      setContentSubmitting(false);
    }
  };

  const handleAddQuizQuestion = () => {
    setShowQuizQuestionModal(true);
  };

  const handleQuestionInputChange = e => {
    const { name, value } = e.target;
    setQuestionForm(f => ({ ...f, [name]: value }));
  };

  const handleOptionChange = (index, field, value) => {
    setQuestionForm(f => {
      const newOptions = [...f.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return { ...f, options: newOptions };
    });
  };

  const handleCreateQuestion = async e => {
    e.preventDefault();
    setQuestionFormError('');
    setQuestionSubmitting(true);

    if (!questionForm.question_text) {
      setQuestionFormError('Question text is required.');
      setQuestionSubmitting(false);
      return;
    }

    const validOptions = questionForm.options.filter(o => o.option_text.trim() !== '');
    if (validOptions.length < 2) {
      setQuestionFormError('Please provide at least two answer options.');
      setQuestionSubmitting(false);
      return;
    }

    if (questionForm.question_type === 'multiple-choice' && !questionForm.options.some(o => o.is_correct)) {
      setQuestionFormError('Please mark at least one option as correct.');
      setQuestionSubmitting(false);
      return;
    }

    try {
      setQuizData(prev => {
        const newQuizData = prev ? JSON.parse(prev) : [];
        newQuizData.push({
          question_text: questionForm.question_text,
          question_type: questionForm.question_type,
          options: questionForm.options.filter(o => o.option_text.trim() !== '')
        });
        return JSON.stringify(newQuizData);
      });

      setShowQuizQuestionModal(false);
      setQuestionForm({
        question_text: '',
        question_type: 'multiple-choice',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ]
      });
      setShowQuizModal(true);
    } catch (err) {
      setQuestionFormError(err.message);
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, courseId: id });
  };

  const confirmDelete = async () => {
    const id = confirmDialog.courseId;
    setDeleteLoading(id);
    setConfirmDialog({ isOpen: false, courseId: null });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }

      // Remove from local state
      setCourses(courses.filter(c => c.id !== id));
      if (selectedCourse === id) {
        setSelectedCourse(null);
        setCourseDetails(null);
      }
    } catch (err) {
      setAlertDialog({ isOpen: true, title: 'Delete Failed', message: 'Error deleting course: ' + err.message, type: 'error' });
    } finally {
      setDeleteLoading(null);
    }
  };

  const fetchCourseDetails = async (id) => {
    setCourseLoading(true);
    try {
      const res = await fetch(`/api/courses/${id}`);
      if (!res.ok) throw new Error('Failed to fetch course details');
      const data = await res.json();
      setCourseDetails(data.course);
    } catch (err) {
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Error fetching course details: ' + err.message, type: 'error' });
    } finally {
      setCourseLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    if (selectedCourse === course.id) {
      setSelectedCourse(null);
      setCourseDetails(null);
    } else {
      setSelectedCourse(course.id);
      fetchCourseDetails(course.id);
    }
  };

  const handleViewContent = (content) => {
    console.log('Viewing content:', content);
    setViewingContent(content);

    if (content.content_type === 'quiz') {
      setShowQuizViewer(true);
    } else if (content.content_type === 'video') {
      if (content.url) {
        setViewingVideoUrl(content.url);
        setShowVideoViewer(true);
      } else {
        setAlertDialog({ isOpen: true, title: 'Video Not Available', message: 'Video URL not available. Please check if the video was uploaded properly.', type: 'warning' });
      }
    } else if (content.content_type === 'pdf') {
      if (content.url) {
        setShowContentViewer(true);
      } else {
        setAlertDialog({ isOpen: true, title: 'PDF Not Available', message: 'PDF URL not available. Please check if the PDF was uploaded properly.', type: 'warning' });
      }
    } else {
      setShowContentViewer(true);
    }
  };

  const handleEditQuiz = (content) => {
    setSelectedContent(content);
    setShowQuizManager(true);
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contents/${contentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchCourseDetails(selectedCourse);
      } else {
        setAlertDialog({ isOpen: true, title: 'Delete Failed', message: data.message || 'Failed to delete content', type: 'error' });
      }
    } catch (err) {
      setAlertDialog({ isOpen: true, title: 'Delete Failed', message: 'Failed to delete content', type: 'error' });
      console.error('Error deleting content:', err);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description || '',
      status: course.status
    });
    setEditFormError('');
    setShowEditCourseModal(true);
  };

  const handleQuizSubmit = () => {
    console.log('Submit quiz:', quizData);
    setShowQuizModal(false);
    setQuizData('');
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title || '',
      description: module.description || '',
      order: module.order || null
    });
    setShowModuleModal(true);
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setModuleForm({
      title: '',
      description: '',
      order: null
    });
    setShowModuleModal(true);
  };

  const handleAddContent = (module) => {
    setSelectedModule(module);
    setShowContentModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowModal(false);
  };


  const handleCloseModuleModal = () => {
    setShowModuleModal(false);
    setEditingModule(null);
    setModuleForm({
      title: '',
      description: '',
      order: null
    });
  };

  const handleCloseContentModal = () => {
    setShowContentModal(false);
    setContentLocalUrl(null);
  };

  const handleCloseQuizModal = () => {
    setShowQuizModal(false);
    setQuizData('');
  };

  const handleCloseQuestionModal = () => {
    setShowQuizQuestionModal(false);
    setShowQuizModal(true);
  };

  return (
    <>
      <PageHeader
        icon="📚"
        title="Course Management"
        description="Create, manage, and organize your educational content"
        action={{
          label: window.innerWidth > 768 ? "Create New Course" : "Create",
          icon: <FaPlus size={18} />,
        }}
        showAction={true}
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onSearchClear={() => setSearchTerm('')}
        onActionClick={() => setShowModal(true)}
      />

      {/* Create Course Modal */}
      <FormModal isOpen={showModal} onClose={handleCloseCreateModal} className="form-modal">
        <CourseForm
          form={form}
          onInputChange={handleInputChange}
          onSubmit={handleCreate}
          error={formError}
          submitting={submitting}
          title="Create Course"
          onClose={handleCloseCreateModal}
        />
      </FormModal>

      {/* Edit Course Modal */}
      <FormModal isOpen={showEditCourseModal} onClose={handleCloseEditModal}>
        <CourseForm
          form={editForm}
          onInputChange={handleEditFormChange}
          onSubmit={handleUpdateCourse}
          error={editFormError}
          submitting={editSubmitting}
          title="Edit Course"
          isEdit={true}
          onClose={handleCloseEditModal}
        />
      </FormModal>

      {/* Module Creation/Edit Modal */}
      <FormModal isOpen={showModuleModal} onClose={handleCloseModuleModal}>
        <ModuleForm
          form={moduleForm}
          onInputChange={handleModuleInputChange}
          onSubmit={editingModule ? handleUpdateModule : handleCreateModule}
          error={moduleFormError}
          submitting={moduleSubmitting}
          onClose={handleCloseModuleModal}
          isEditing={!!editingModule}
        />
      </FormModal>

      {/* Course List and Details */}
      <div
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
          display: 'flex',
          gap: 24,
        }}
      >
        <CourseListPanel
          courses={courses}
          filteredCourses={filteredCourses}
          loading={loading}
          error={error}
          selectedCourse={selectedCourse}
          onCourseClick={handleCourseClick}
          onEditCourse={handleEditCourse}
          onDelete={handleDelete}
          deleteLoading={deleteLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchClear={() => setSearchTerm('')}
        />

        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            width: '60%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <CourseDetails
            course={courseDetails}
            selectedCourse={selectedCourse}
            courseLoading={courseLoading}
            onAddModule={handleAddModule}
            onAddContent={handleAddContent}
            onViewContent={handleViewContent}
            onEditQuiz={handleEditQuiz}
            onDeleteContent={handleDeleteContent}
            onEditModule={handleEditModule}
          />
        </div>
      </div>

      {/* Content Creation Modal */}
      <FormModal isOpen={showContentModal} onClose={handleCloseContentModal}>
        <ContentForm
          form={contentForm}
          contentFile={contentFile}
          contentLocalUrl={contentLocalUrl}
          onInputChange={handleContentInputChange}
          onFileChange={handleFileChange}
          onSubmit={handleCreateContent}
          error={contentFormError}
          submitting={contentSubmitting}
          selectedModule={selectedModule}
          fileInputRef={fileInputRef}
          onClose={handleCloseContentModal}
          simulationData={simulationData}
          setSimulationData={setSimulationData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      </FormModal>

      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModal
          quizData={quizData}
          onAddQuestion={handleAddQuizQuestion}
          onSubmit={handleQuizSubmit}
          submitting={contentSubmitting}
          onClose={handleCloseQuizModal}
          contentTitle={contentForm.title}
        />
      )}
      {/* Quiz Question Modal */}
      <FormModal isOpen={showQuizQuestionModal} onClose={handleCloseQuestionModal}>
        <QuizQuestionForm
          form={questionForm}
          onInputChange={handleQuestionInputChange}
          onOptionChange={handleOptionChange}
          onSubmit={handleCreateQuestion}
          error={questionFormError}
          submitting={questionSubmitting}
          onClose={handleCloseQuestionModal}
        />
      </FormModal>

      {/* Video Viewer Modal */}
      {showVideoViewer && viewingVideoUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: 24,
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'relative',
            width: 800,
          }}>
            <button
              onClick={() => {
                setShowVideoViewer(false);
                setViewingVideoUrl(null);
              }}
              style={{
                position: 'absolute',
                top: -5,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              ×
            </button>
            <video
              src={viewingVideoUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                height: '500px',
                borderRadius: 8,
                objectFit: 'contain'
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Quiz Manager Modal */}
      {showQuizManager && selectedContent && (
        <QuizManager
          contentId={selectedContent.id}
          onClose={() => {
            setShowQuizManager(false);
            setSelectedContent(null);
          }}
        />
      )}
      <ContentViewer
        isOpen={showContentViewer}
        content={viewingContent}
        onClose={() => {
          setShowContentViewer(false);
          setViewingContent(null);
        }}
      />

      <QuizViewer
        isOpen={showQuizViewer}
        content={viewingContent}
        onClose={() => {
          setShowQuizViewer(false);
          setViewingContent(null);
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, courseId: null })}
        onConfirm={confirmDelete}
        title="Delete Course?"
        message="Are you sure you want to delete this course? All modules and content will be permanently removed. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ isOpen: false, title: '', message: '', type: 'info' })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </>

  );
};

export default CourseList;
