export const maskPhoneNumber = (phoneNumber: string) => {
  //keep the first 4 digits and  last 2 digits but replace the rest with *
  //here is an exmaple: 1234567890 => 1234******90
  return phoneNumber.replace(/.(?=.{2})/g, "*");
};

//replace any character that is not a number with empty string
//except if the first digit is +, then keep it
export const cleanPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/[^0-9+]/g, "");
};
