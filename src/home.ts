import { elements } from "./elements";
import { getUser } from "./user-api";

const { header } = elements();

(async function () {
  try {
    const { username } = await getUser();
    header.textContent += username;
  } catch (e: any) {
    window.location.replace("index.html");
  }
})();
