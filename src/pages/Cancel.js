import { Link } from 'react-router-dom';

const Cancel = () => {
  return (
    <div className="container mt-5 text-center">
      <h2>❌ Pagamento annullato o fallito</h2>
      <p>Il tuo pagamento non è andato a buon fine. Nessun importo è stato addebitato.</p>
      <p>Puoi riprovare o tornare al carrello per modificare l'ordine.</p>
      <Link to="/cart" className="btn btn-warning mt-3">
        Torna al carrello
      </Link>
    </div>
  );
};

export default Cancel;

