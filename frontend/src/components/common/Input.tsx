type Props = React.InputHTMLAttributes<HTMLInputElement>;

const Input = (props: Props) => {
  return (
    <input
      {...props}
      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    />
  );
};

export default Input;
