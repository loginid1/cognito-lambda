import UAParser from "ua-parser-js";

export const getDefaultCredentialName = () => {
  const details = new UAParser();
  const { browser, device, os } = details.getResult();

  let name = "";
  if (os.name) {
    name += os.name;
  }
  if (os.version) {
    name += ` ${os.version}`;
  }

  name += " - ";

  if (browser.name) {
    name += browser.name;
  }
  if (browser.version) {
    name += ` ${browser.version}`;
  }

  if (device.type) {
    name += ` ( ${device.type} - ${device.vendor} )`;
  }

  return name;
};
