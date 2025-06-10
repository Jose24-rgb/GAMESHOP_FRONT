import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserMenu = ({ avatarLetter, menuOpen, setMenuOpen, user, handleLogout, id, ariaLabel }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, setMenuOpen]);

  const renderAvatar = () => {
    if (user?.profilePic) {
      return (
        <img
          src={`http://localhost:5000${user.profilePic}?t=${Date.now()}`}
          alt="Profilo"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #000'
          }}
        />
      );
    } else if (avatarLetter) {
      return (
        <div
          className="border border-dark d-flex justify-content-center align-items-center"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}
        >
          {avatarLetter}
        </div>
      );
    } else {
      return (
        <img
          src="/icone/User Icona.png"
          alt="Icona utente"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }
  };

  return (
    <div className="position-relative" id={id} ref={menuRef}>
      <div
        onClick={() => setMenuOpen(prev => !prev)}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label={ariaLabel}
      >
        {renderAvatar()}
      </div>

      {menuOpen && (
        <div
          className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm"
          style={{ zIndex: 1000 }}
          role="menu"
          aria-label={`${ariaLabel} contenuto`}
        >
          <ul className="list-unstyled m-0 p-2 text-dark">
            {!user ? (
              <>
                <li><Link to="/login" className="dropdown-item" role="menuitem">🔑 Login</Link></li>
                <li><Link to="/register" className="dropdown-item" role="menuitem">📝 Register</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/orders" className="dropdown-item" role="menuitem">📦 Ordini</Link></li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/config');
                    }}
                    role="menuitem"
                  >
                    ⚙️ Configurazione
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="dropdown-item text-danger" role="menuitem">
                    🚪 Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;





  
