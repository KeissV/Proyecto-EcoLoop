import { Redirect } from "expo-router";

export default function LogroRachaActivaRedirect() {
  return <Redirect href={{ pathname: "/logro/[id]", params: { id: "racha-activa" } }} />;
}
