import { Tabs } from "expo-router";
import { Image } from "react-native";

const GREEN = "#3BAB4F";
const MUTED = "#888";

function TabIcon({ icon, focused }: { icon: any; focused: boolean }) {
  return (
    <Image
      source={icon}
      style={{ width: 28, height: 28, opacity: focused ? 1 : 0.6 }}
      resizeMode="contain"
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          paddingTop: 6,
          paddingBottom: 12,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require("../../../assets/images/icons/tab-home.jpeg")}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: "Buscar",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require("../../../assets/images/icons/tab-search.jpeg")}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="retos"
        options={{
          title: "Retos",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require("../../../assets/images/icons/tab-retos.jpeg")}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logros"
        options={{
          title: "Logros",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require("../../../assets/images/icons/tab-logros.jpeg")}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={require("../../../assets/images/icons/tab-perfil.jpeg")}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="botella-pet"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cascara-banana"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="plasticos"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reto-aprendizaje"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reto-completado"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="logro-racha-activa"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}