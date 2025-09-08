import { Toaster } from "./components/ui/sonner";
import AppRouter from "./router";

function App() {
  return (
    <>
      <Toaster richColors />
      <div className="max-w-8xl min-h-screen mx-auto">
        <AppRouter />
      </div>
    </>
  );
}

export default App;
