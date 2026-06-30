import { Redirect } from "expo-router";

export default function CascaraBananaRedirect() {
  return <Redirect href={{ pathname: "/residuo/[id]", params: { id: "cascara-banana" } }} />;
}
