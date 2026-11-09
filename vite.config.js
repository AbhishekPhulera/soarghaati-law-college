import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const siteConfigMiddleware = (req, res, next) => {
  const cleanUrl = (req.url || '').split('?')[0];

  // API: Site Configuration Persistence Engine
  if (cleanUrl === '/api/site-config') {
    const publicConfigPath = resolve(import.meta.dirname, 'public/site-config.json');
    const rootConfigPath = resolve(import.meta.dirname, 'site-config.json');
    const distConfigPath = resolve(import.meta.dirname, 'dist/site-config.json');

    if (req.method === 'GET') {
      try {
        let data = null;
        if (fs.existsSync(publicConfigPath)) {
          data = fs.readFileSync(publicConfigPath, 'utf-8');
        } else if (fs.existsSync(rootConfigPath)) {
          data = fs.readFileSync(rootConfigPath, 'utf-8');
        }
        if (data) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.writeHead(200);
          res.end(data);
          return;
        }
      } catch (e) {
        console.error('[API site-config GET] Error:', e);
      }
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Config file not found' }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const formatted = JSON.stringify(parsed, null, 2);

          // 1. Write to public/site-config.json (public served file)
          fs.writeFileSync(publicConfigPath, formatted, 'utf-8');

          // 2. Write to root site-config.json (workspace backup)
          fs.writeFileSync(rootConfigPath, formatted, 'utf-8');

          // 3. Write to dist/site-config.json if dist folder exists
          try {
            const distDir = resolve(import.meta.dirname, 'dist');
            if (fs.existsSync(distDir)) {
              fs.writeFileSync(distConfigPath, formatted, 'utf-8');
            }
          } catch (_) {}

          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
          return;
        } catch (e) {
          console.error('[API site-config POST] Error:', e);
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: e.message }));
          return;
        }
      });
      return;
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Allow', 'GET, POST, OPTIONS');
      res.writeHead(204);
      res.end();
      return;
    }
  }

  // API: Brochure Status, Upload & Deletion Middleware
  if (cleanUrl === '/api/brochure') {
    const publicConfigPath = resolve(import.meta.dirname, 'public/site-config.json');
    const rootConfigPath = resolve(import.meta.dirname, 'site-config.json');
    const uploadsDir = resolve(import.meta.dirname, 'public/uploads/brochure');

    if (req.method === 'GET') {
      try {
        let config = null;
        if (fs.existsSync(publicConfigPath)) {
          config = JSON.parse(fs.readFileSync(publicConfigPath, 'utf-8'));
        } else if (fs.existsSync(rootConfigPath)) {
          config = JSON.parse(fs.readFileSync(rootConfigPath, 'utf-8'));
        }
        const bUrl = config?.institution?.brochureUrl || '';
        const bName = config?.institution?.brochureFileName || (bUrl ? 'Soarghaati_Law_College_Brochure.pdf' : '');
        const bSize = config?.institution?.brochureFileSize || '';
        const bDate = config?.institution?.brochureUploadedAt || '';
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          exists: Boolean(bUrl),
          url: bUrl,
          fileName: bName,
          fileSize: bSize,
          uploadedAt: bDate
        }));
        return;
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
        return;
      }
    }

    if (req.method === 'POST') {
      const isDelete = (req.url || '').includes('action=delete');
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          let hasJsonDelete = false;
          try {
            const j = JSON.parse(body);
            if (j.action === 'delete') hasJsonDelete = true;
          } catch (_) {}

          if (isDelete || hasJsonDelete) {
            if (fs.existsSync(uploadsDir)) {
              const files = fs.readdirSync(uploadsDir);
              for (const f of files) {
                if (f.endsWith('.pdf')) {
                  try { fs.unlinkSync(resolve(uploadsDir, f)); } catch (_) {}
                }
              }
            }
            [publicConfigPath, rootConfigPath].forEach(cp => {
              if (fs.existsSync(cp)) {
                const c = JSON.parse(fs.readFileSync(cp, 'utf-8'));
                if (c.institution) {
                  c.institution.brochureUrl = '';
                  c.institution.brochureFileName = '';
                  c.institution.brochureFileSize = '';
                  c.institution.brochureUploadedAt = '';
                  fs.writeFileSync(cp, JSON.stringify(c, null, 2), 'utf-8');
                }
              }
            });
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: 'Brochure deleted from disk' }));
            return;
          }
        } catch (e) {}
      });
      return;
    }
  }

  if (cleanUrl === '/AdminDashboard') {
    res.writeHead(302, { Location: '/AdminDashboard/' });
    res.end();
    return;
  }
  if (cleanUrl.startsWith('/AdminDashboard/') && !cleanUrl.includes('.')) {
    req.url = '/AdminDashboard/index.html';
  }
  if (cleanUrl === '/AdminEdit') {
    res.writeHead(302, { Location: '/AdminEdit/' });
    res.end();
    return;
  }
  if (cleanUrl.startsWith('/AdminEdit/') && !cleanUrl.includes('.')) {
    req.url = '/AdminEdit/index.html';
  }
  if (cleanUrl === '/faculty') {
    res.writeHead(302, { Location: '/faculty/' });
    res.end();
    return;
  }
  if (cleanUrl.startsWith('/faculty/') && !cleanUrl.includes('.')) {
    req.url = '/faculty/index.html';
  }
  next();
};

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: false,
    host: true,
    watch: {
      ignored: ['**/site-config.json', '**/public/site-config.json', '**/dist/**']
    }
  },
  preview: {
    port: 3000,
    host: true
  },
  publicDir: 'public',
  plugins: [
    {
      name: 'admin-dashboard-spa-rewrite',
      configureServer(server) {
        server.middlewares.use(siteConfigMiddleware);
      },
      configurePreviewServer(server) {
        server.middlewares.use(siteConfigMiddleware);
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        faculty: resolve(import.meta.dirname, 'faculty/index.html'),
        admin: resolve(import.meta.dirname, 'AdminDashboard/index.html'),
        adminEdit: resolve(import.meta.dirname, 'AdminEdit/index.html')
      }
    }
  }
});
