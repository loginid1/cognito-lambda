import { getUser } from "./user-api";

(async function () {
  //we don't want authenticated users on these pages
  try {
    await getUser();
    window.location.replace("home.html");
  } catch (e: any) {}
})();
