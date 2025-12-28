🎅 Santa's Emergency Terminal
I vibecoded this web app for a colleague, hosted it on Netlify, and sent the URL to them for my office's Secret Santa event. It features a simple challenge which, upon solving, reveals the hint for their gift.

📖 About
This project is an interactive, retro-style terminal simulation. It mimics a kernel loading process with "critical errors" and drops the user into an emergency shell where they must use basic terminal commands to uncover clues and solve a simple puzzle.

🚀 Features
Retro Terminal UI: Matrix-style green-on-black interface with scanlines and flicker effects.

Simulated Boot Sequence: A detailed sequence including file system checks and a simulated kernel panic.

Interactive Commands: Supports standard commands like ls, cat, whoami, help, and clear.

Secret Protocol: Includes a sudo recover_gift command that triggers a password-protected decryption sequence.

Security Lockout: A "Self-Destruct" sequence that triggers after 5 failed attempts to prevent brute-forcing.

🛠️ Tech Stack
React 19

Vite (Build tool)

Tailwind CSS (Styling via CDN)

TypeScript

⚙️ Customization
To personalize this for your own Secret Santa, you can edit the following in App.tsx:

1. Change the Recipient's Name: Search for "Vyshak" (or "vyshak") in App.tsx and replace it with your colleague's name. It appears in:

The boot sequence greeting ("Identity verified: ... detected").

The terminal prompt (vyshak@santa-server:~$).

The whoami command output.

2. Edit the Riddle (The Hint): Locate the cat command logic. You can change the text inside the biological_scan.log case to your own custom riddle.

3. Change the Answer: The app uses a checksum to verify the password without putting plain text in the code.

Find the verifyChecksum function.

To use a simple password instead of a checksum, change the function to: return str.toLowerCase() === "your-password-here";.

4. Update the Final Reveal: In the handleDecryptionComplete function, you can update the Base64 strings to change the success message and the gift access code revealed at the end.

💻 Run Locally
Prerequisites: Node.js installed on your machine.

Clone the repository (or download the files).

Install dependencies:

Bash
npm install

Run the development server:

Bash
npm run dev

Open the app: Navigate to http://localhost:3000 in your browser.

🎮 How to Play
Wait for the system to boot into the emergency shell.

Type help to see authorized commands.

Explore the system using the available commands to find clues.

Run sudo recover_gift and enter the correct Bio-Scan code to reveal the secret gift coordinates.