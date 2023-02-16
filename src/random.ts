export const randomPassword = () => {
  const randomSelect = (str: string): string => {
    return str[0 + Math.floor(Math.random() * str.length - 0)];
  };

  const specialChars = "!@#$%^&*";
  const numberChars = "1234567890";
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const upperChars = lowerChars.toUpperCase();

  const map = [specialChars, numberChars, lowerChars, upperChars];
  const rest = map.join("");

  let result = "";

  //required
  for (let i = 0; i < map.length; i++) {
    const requiredChars = map[i];
    result += randomSelect(requiredChars);
  }

  //rest
  for (let i = 24 - map.length; i > 0; i--) {
    result += randomSelect(rest);
  }

  return result;
};
