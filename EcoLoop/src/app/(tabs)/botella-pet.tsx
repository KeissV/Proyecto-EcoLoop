import { Redirect } from "expo-router";

export default function BotellaPetRedirect() {
  return <Redirect href={{ pathname: "/residuo/[id]", params: { id: "botella-pet" } }} />;
}
