import "./Sidebar.css";

function Sidebar() {
  return (
    <section className="sidebar">
      <button type="button" title="New chat">
        <img src="src/assets/logo.png" alt="orvexa logo" />
        <i className="fa-regular fa-pen-to-square"></i>
      </button>
      <ul className="history">
        <li>Weekend Plan for Balance</li>
        <li>Online Food Delivery Impact</li>
        <li>Humanize AI Text</li>
      </ul>
      <div>
        <p>Made with &hearts; by Orvexa</p>
      </div>
    </section>
  );
}

export default Sidebar;
