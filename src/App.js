import { useEffect, useState } from "react";
import logo from './logo.svg';
import './App.css';

function App() {
    const [greetingMsg, setGreetingMsg] = useState("");
    useEffect(() => {
        const getData = async () => {
            let url = "/api/greeting?locale=" + navigator.language;
            fetch(url)
                .then(response => response.json())
                .then(msg => setGreetingMsg(msg.greeting));
        };
        getData();
    }, []);
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                <div>{greetingMsg}</div>
            </header>
        </div>
    );
}

export default App;
