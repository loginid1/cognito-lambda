import { BUTTONS_COLOR } from "../environment/";

interface Props {
  fill?: string;
}

const CloseIcon = function ({ fill }: Props) {
  if (!fill) {
    fill = BUTTONS_COLOR;
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 273 273"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M237.094 70.25H201.969V48.2969C201.969 38.6101 194.093 30.7344 184.406 30.7344H96.5938C86.9069 30.7344 79.0312 38.6101 79.0312 48.2969V70.25H43.9062C39.0491 70.25 35.125 74.1741 35.125 79.0312V87.8125C35.125 89.0199 36.1129 90.0078 37.3203 90.0078H53.8949L60.673 233.526C61.112 242.884 68.8505 250.266 78.208 250.266H202.792C212.177 250.266 219.888 242.911 220.327 233.526L227.105 90.0078H243.68C244.887 90.0078 245.875 89.0199 245.875 87.8125V79.0312C245.875 74.1741 241.951 70.25 237.094 70.25ZM182.211 70.25H98.7891V50.4922H182.211V70.25Z"
        fill={fill}
      />
    </svg>
  );
};

export default CloseIcon;
