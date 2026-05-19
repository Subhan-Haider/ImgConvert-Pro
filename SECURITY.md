# Security Policy & Local Sandbox Assurances

Thank you for utilizing **ImgConvert Pro**. Security and document privacy are the foundational pillars upon which this entire application was engineered. As a local-first workspace, your files, vectors, and character streams are processed entirely on your own hardware without ever touching an external server.

---

## 🔒 The Local Sandbox Security Paradigm

ImgConvert Pro implements a strict **Client-Side Isolated Execution Model**. It is helpful to understand the underlying mechanics of how your data is secured:

1. **Zero Cloud Uploads:** No document, image, metadata property, or text string is ever uploaded, cached, or transferred to any cloud microservice or remote server.
2. **Volatile RAM Storage:** File arrays are loaded strictly as temporary `ArrayBuffer` objects inside your current browser tab's virtual memory sandbox.
3. **No Persistent Disk Footprint:** Once you close your browser tab or clear your active workspace, all processed files and memory allocations completely vanish from your physical device.
4. **WASM Core Boundaries:** Background WebAssembly modules (e.g., Tesseract OCR Web Workers) execute inside standard browser sandboxed threads, fully isolated from your computer's local operating system directories.

---

## 🛠️ Supported Versions

We actively monitor and patch the core frontend dependencies and compilation channels of the following releases:

| Version | Supported | Security Patches |
| :--- | :---: | :---: |
| **v2.x (Stable)** | 🟢 Yes | Active stable branch |
| **v1.x (Legacy)** | 🔴 No | Please upgrade to v2.x |

---

## 🛡️ Reporting a Vulnerability

If you discover a potential security flaw, configuration loophole, or package vulnerability within our dependency tree, please **do not open a public issue** on GitHub. Instead, report it privately using the reporting channels below:

* **Primary Email:** [security@subhan.tech](mailto:security@subhan.tech)
* **Secondary Email:** [security@lootops.me](mailto:security@lootops.me)

Please include a detailed description of:
* The affected module or dependency
* Steps or sample mock files to reproduce the issue
* Potential impact or attack vector details

Our security team will review your report within **24–48 hours** and coordinate a resolution patch immediately.

---

## 📜 Compliance Auditing

Because ImgConvert Pro operates completely offline inside the browser:
* It is fully **GDPR-compliant** (no personal data is collected or stored).
* It satisfies strict **HIPAA** and **ISO 27001** document security regulations, making it safe for medical charts, legal contracts, and financial accounting sheets.
