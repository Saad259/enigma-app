import React, { useState, useEffect } from "react";
import './App.css'

let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let rotor1 = shuffle([...alphabet]); // Randomized mappings for rotor1
let rotor2 = shuffle([...alphabet]); // Randomized mappings for rotor2
let rotor3 = shuffle([...alphabet]); // Randomized mappings for rotor3
let rotation1 = 0;
let rotation2 = 0;

// Shuffle function to randomize rotor mappings
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Create a reflector with reversible mappings
function createReflector() {
  const shuffled = shuffle([...alphabet]); // Shuffle a copy of the alphabet
  const reflector = {};
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      const char1 = shuffled[i];
      const char2 = shuffled[i + 1];
      reflector[char1] = char2;
      reflector[char2] = char1;
    }
  }
  return reflector;
}

// Rotate rotor mappings
function rotateRotor(rotor) {
  const shifted = rotor.slice(1).concat(rotor[0]); // Shift the rotor left
  return shifted;
}

// Main App Component
function App() {
  const [rotor1State, setRotor1State] = useState(rotor1);
  const [rotor2State, setRotor2State] = useState(rotor2);
  const [rotor3State, setRotor3State] = useState(rotor3);
  const [output, setOutput] = useState("");

  const reflector = createReflector(); // Initialize reflector

  // Handle key press for input
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toUpperCase();
      if (alphabet.includes(key)) {
        // Step through rotors
        const step1 = rotor1State[alphabet.indexOf(key)];
        const step2 = rotor2State[alphabet.indexOf(step1)];
        const step3 = rotor3State[alphabet.indexOf(step2)];

        // Reflector step
        const reflected = reflector[step3] || step3;

        // Back through rotors
        const reverse3 = alphabet[rotor3State.indexOf(reflected)];
        const reverse2 = alphabet[rotor2State.indexOf(reverse3)];
        const reverse1 = alphabet[rotor1State.indexOf(reverse2)];

        setOutput(`Input: ${key} -> Output: ${reverse1}`);

        // Rotate rotors
        setRotor1State((prev) => rotateRotor(prev));
        rotation1++;
        if (rotation1 % 26 === 0) {
          setRotor2State((prev) => rotateRotor(prev));
          rotation2++;
          if (rotation2 % 26 === 0) {
            setRotor3State((prev) => rotateRotor(prev));
          }
        }

        const outputKeyButton = document.querySelector(`.keybutton[data-key="${reverse1}"]`);
        if(outputKeyButton){
          outputKeyButton.classList.add("active");
          setTimeout(() => outputKeyButton.classList.remove("active"), 500);
        }
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [rotor1State, rotor2State, rotor3State, reflector]);

  // Display rotor configuration
  function printRotor(rotor) {
    return rotor.slice(0, 3).map((char, index) => (
      <span key={index} style={{ marginRight: "5px" }}>
        {char}
      </span>
    ));
  }

  return (
    <div className="App" style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Enigma-like Machine</h1>
      <p>Press any key to see the mapped output.</p>
      <div style={{ margin: "20px 0" }}>
        <h3>Rotor 1</h3>
        {printRotor(rotor1State)}
      </div>
      <div style={{ margin: "20px 0" }}>
        <h3>Rotor 2</h3>
        {printRotor(rotor2State)}
      </div>
      <div style={{ margin: "20px 0" }}>
        <h3>Rotor 3</h3>
        {printRotor(rotor3State)}
      </div>
      <div style={{ marginTop: "30px", fontSize: "1.5rem", color: "blue" }}>
        {output}
      </div>

      <div className="keyboard">
        {alphabet.map((char) => (
          <div className="keybutton" 
          key={char} 
          data-key={char}
          style={{ margin: "5px", border: "1px solid black", padding: "10px" }}
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
