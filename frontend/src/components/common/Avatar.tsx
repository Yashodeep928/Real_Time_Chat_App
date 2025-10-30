type Props = { src?: string; size?: number };

const Avatar = ({ src, size = 40 }: Props) => {
  return (
    <img
      src={src || "/src/assets/defaultAvatar.png"}
      className={`rounded-full`}
      width={size}
      height={size}
      alt="avatar"
    />
  );
};

export default Avatar;
