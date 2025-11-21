const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-md p-6
        ${hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
