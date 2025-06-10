import { useState, useEffect } from 'react'; 
import './Filters.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapDropdown from './BootstrapDropdown';

const Filters = ({ onFilterChange, defaultFilters = {}, hideFilters = false, onResetSearch }) => {
  const [filters, setFilters] = useState({
    system: '',
    platform: '',
    genre: '',
    sort: '',
    type: '',
    priceMin: '',
    priceMax: '',
    inStock: false,
    ...defaultFilters,
  });

  const [rotate, setRotate] = useState(false);

  const systems = ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Switch', 'Switch 2'];

  const platforms = [
    'Epic Games', 'Steam', 'EA App', 'Rockstar', 'Ubisoft Connect',
    'Nintendo eShop', 'Microsoft Store', 'PlayStation Store', 'Xbox Store',
    'Blizzard', 'NetEase'
  ];

  const genres = [
    'Arcade', 'Avventura', 'Azione', 'FPS', 'MMO', 'Indies',
    'CO-OP ONLINE', 'Online', 'Sports', 'Simulazione', 'Lotta', 'Gare'
  ];

  const sorts = [
    'Sconto: migliore', 'Prezzo: da basso ad alto',
    'Prezzo: da alto a basso', 'Uscita: nuovo', 'Uscita: vecchio',
    'Recensioni: migliore', 'Recensioni: peggiore'
  ];

  const types = [
    { label: 'Tutto', value: '' },
    { label: 'Giochi e DLC', value: 'Gioco + DLC' },
    { label: 'Solo DLC', value: 'DLC' },
    { label: 'Solo giochi', value: 'Gioco' },
    { label: 'Preordini', value: 'Preordine' },
    { label: 'Prossimamente', value: 'Prossimamente' },
    { label: 'Free to Play', value: 'Free to Play' }
  ];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    const newFilters = { ...filters, [name]: val };
    setFilters(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      system: '',
      platform: '',
      genre: '',
      sort: '',
      type: '',
      priceMin: '',
      priceMax: '',
      inStock: false,
    };
    setFilters(resetFilters);

    if (onResetSearch) onResetSearch();

    setRotate(true);
    setTimeout(() => setRotate(false), 400);
  };

  return (
    <div className="mb-4 d-flex flex-column align-items-center gap-3">
      {!hideFilters && (
        <div className="row w-100 justify-content-center" style={{ maxWidth: '1000px' }}>
          <div className="col-md-3 mb-2">
            <BootstrapDropdown name="system" label="Sistemi" options={systems} value={filters.system} onChange={handleChange} />
          </div>
          <div className="col-md-3 mb-2">
            <BootstrapDropdown name="platform" label="Piattaforme" options={platforms} value={filters.platform} onChange={handleChange} />
          </div>
          <div className="col-md-3 mb-2">
            <BootstrapDropdown name="genre" label="Generi..." options={genres} value={filters.genre} onChange={handleChange} />
          </div>
          <div className="col-md-3 mb-2">
            <BootstrapDropdown name="sort" label="Ordina per:" options={sorts} value={filters.sort} onChange={handleChange} />
          </div>
        </div>
      )}

      <div className="row w-100 justify-content-center" style={{ maxWidth: '1000px' }}>
        {!hideFilters && (
          <>
            <div className="col-auto mb-2">
              <input
                type="number"
                name="priceMin"
                className="form-control form-control-lg text-center"
                placeholder="Min €"
                value={filters.priceMin}
                onChange={handleChange}
                aria-label="Prezzo minimo"
                style={{ width: '100px' }}
              />
            </div>
            <div className="col-auto mb-2">
              <input
                type="number"
                name="priceMax"
                className="form-control form-control-lg text-center"
                placeholder="Max €"
                value={filters.priceMax}
                onChange={handleChange}
                aria-label="Prezzo massimo"
                style={{ width: '100px' }}
              />
            </div>
            <div className="col-md-2 stock-checkbox-wrapper mb-2">
              <input
                type="checkbox"
                name="inStock"
                className="form-check-input me-2"
                onChange={handleChange}
                onMouseUp={(e) => e.currentTarget.blur()}
                checked={filters.inStock}
                aria-label="Solo prodotti disponibili in stock"
                style={{ transform: 'scale(1.5)' }}
              />
              <label className="form-check-label">In stock</label>
            </div>
            <div className="col-md-3 mb-2">
              <BootstrapDropdown
                name="type"
                label="Tutto"
                options={types.map(t => t.label)}
                value={types.find(t => t.value === filters.type)?.label || ''}
                onChange={(e) => {
                  const selected = types.find(t => t.label === e.target.value);
                  handleChange({
                    target: {
                      name: 'type',
                      value: selected ? selected.value : ''
                    }
                  });
                }}
              />
            </div>
          </>
        )}

        <div className="col-auto mb-2 d-flex justify-content-center align-items-center">
          <button
            className={`reset-icon-btn ${rotate ? 'rotate' : ''}`}
            onClick={handleReset}
            title="Reset filtri"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;






























