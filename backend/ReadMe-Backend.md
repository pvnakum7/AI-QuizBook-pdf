backend/
├── package.json
├── server.js
├── lib/
│   ├── pdfProcessor.js
│   └── utils/
│       ├── logger.js
│       └── textUtils.js
├── routes/
│   ├── index.js
│   ├── upload.js
│   └── ask.js
├── controllers/
│   ├── pdfController.js
│   └── chatController.js
├── services/
│   ├── openaiService.js
│   ├── embeddingService.js
│   └── storageService.js
├── data/
│   ├── uploads/       # PDFs
│   ├── vectors/       # embedding JSONs
│   └── cache/
└── README.md
