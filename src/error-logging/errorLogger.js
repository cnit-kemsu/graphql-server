import { logError } from './logError';
import { publicInfo } from './publicInfo';

export function errorLogger(error, req, res, next) {
  logError(error);
  const info = publicInfo(error);

  if (req.xhr) res.status(500).json(info);
  else {
    res.type('text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        
        <head>
          <meta charset="utf-8"/>
          <title>Ошибка</title>
        </head>
        
        <style>
          body {
            background: lightgrey;
          }
          .error {
            white-space: pre-wrap;
            padding: 30px;
            border: 2px solid slategrey;
            background: white;
            margin: 20px;
            width: fit-content;
          }
          .header {
            color: palevioletred;
            text-transform: uppercase;
            margin-left: 20px;
          }
        </style>
      
        <body>
          
          <h3 class="header">ошибка</h3>
          <div class="error">${info.stack || info.message}</div>
      
        </body>
      
      </html>
    `);
  }

  next();
}