type Props = { children: React.ReactNode; onClick?: () => void };

const Button = ({ children, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
    >
      {children}
    </button>
  );
};

export default Button;
