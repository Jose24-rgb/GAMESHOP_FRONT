import { Dropdown } from 'react-bootstrap';
import './BootstrapDropdown.css';

const BootstrapDropdown = ({ name, label = 'Seleziona', options = [], value, onChange }) => {
  const handleSelect = (selectedValue) => {
    const fakeEvent = {
      target: {
        name,
        value: selectedValue,
      }
    };
    onChange(fakeEvent);
  };

  const handleClear = (e) => {
    e.preventDefault();
    const fakeEvent = {
      target: {
        name,
        value: ''
      }
    };
    onChange(fakeEvent);
  };

  const shouldShowClear = value && value !== '' && value !== label;
  const dropdownId = `dropdown-${name}`;

  return (
    <div className="position-relative select-wrapper">

      <select
        name={name}
        value={value}
        onChange={onChange}
        aria-hidden="true"
        tabIndex={-1}
        hidden
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      <Dropdown onSelect={handleSelect} className="w-100 dropdown-wrapper">
        <Dropdown.Toggle
          as="button"
          id={dropdownId}
          type="button"
          className="custom-toggle dropdown-toggle"
          aria-haspopup="listbox"
          aria-expanded={!!value}
          aria-label={`${label} per ${name}`}
        >
          <span className="toggle-text">{value || label}</span>
          <span className="toggle-arrow">▾</span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100" role="listbox" aria-labelledby={dropdownId}>
          {options.map((opt) => (
            <Dropdown.Item
              key={opt}
              eventKey={opt}
              role="option"
              aria-selected={value === opt}
            >
              {opt}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {shouldShowClear && (
        <button
          type="button"
          className="clear-btn"
          onClick={handleClear}
          title="Cancella selezione"
          aria-label="Cancella selezione"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default BootstrapDropdown;











      
    