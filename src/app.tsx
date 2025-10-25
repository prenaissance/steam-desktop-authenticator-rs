import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "./layout";
import { AuthSteam } from "./pages/auth/steam";
import { Welcome } from "./pages/welcome";

export const App = () => {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />
        </Route>
        <Route path="auth">
          <Route path="steam" element={<AuthSteam />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
