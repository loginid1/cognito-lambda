//replace every character with * except for the following exceptions:
//1. If the first character is + replace it with empty string
//2. Keep the remaining 4 digits at the end
export const maskPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/./g, (char, index) => {
    if (index === 0) {
      return "";
    } else if (index > phoneNumber.length - 5) {
      return char;
    } else {
      return "*";
    }
  });
};

//replace any character that is not a number with empty string
//except if the first digit is +, then keep it
export const cleanPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/[^0-9+]/g, "");
};
