import React from 'react'

const SearchBar = ({placeholder, searchTerm, onSearch}) => {
    return (
        <div className="search-box">
            <div className="search-input">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.15)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                    }}
                />
                {searchTerm && (
                    <button
                        onClick={() => onSearch('')}
                        title="Clear search"
                        onMouseOver={(e) => {
                            e.target.style.background = '#f1f5f9';
                            e.target.style.color = '#ef4444';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'none';
                            e.target.style.color = '#64748b';
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}

export default SearchBar;