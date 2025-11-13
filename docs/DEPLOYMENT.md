# AI HUB Deployment Guide

This document walks through the exact steps required to rebuild and operate the AI HUB terminal on a fresh cloud instance (DigitalOcean droplet, but the same flow applies to EC2/Azure VMs). Follow it sequentially so the environment can be recreated within a couple of hours. The current production instance lives at **https://www.aihublabs.xyz** (IPv4 `170.64.188.172`).

---

## 1. Prerequisites

1. **Cloud account** – DigitalOcean with billing enabled (or equivalent IaaS).
2. **SSH keypair** – Generate with `ssh-keygen -t ed25519 -C "ai-hub"` on your laptop.
3. **Domain registrar** – Namecheap, Porkbun, Cloudflare, etc. You must own the domain.
4. **GitHub access** – Repo `DhruvGoswami10/AI-HUB`.

---

## 2. Provision the Droplet

1. **Create droplet**
   - Image: Ubuntu 22.04 LTS (x64).
   - Size: Basic shared CPU (1 vCPU / 1–2 GB RAM is enough for static hosting).
   - Region: pick closest to target audience.
   - Add SSH public key from step 1.
   - Hostname: `ai-hub-prod`.
2. **Login**
   ```bash
   ssh root@<droplet-ip>
   ```
3. **Patch & harden**
   ```bash
   apt update && apt upgrade -y
   adduser deploy
   usermod -aG sudo deploy
   rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
   ```
4. **Firewall**
   ```bash
   ufw allow OpenSSH
   ufw allow "Nginx Full"
   ufw enable
   ```

---

## 3. Install Web Stack

1. **Nginx**
   ```bash
   apt install -y nginx
   systemctl enable --now nginx
   ```
2. **Directory layout**
   ```bash
   mkdir -p /var/www/ai-hub
   chown -R deploy:deploy /var/www/ai-hub
   ```
3. **Clone repo (as deploy user)**
   ```bash
   su - deploy
   git clone https://github.com/DhruvGoswami10/AI-HUB.git ~/AI-HUB
   rsync -av --delete ~/AI-HUB/ /var/www/ai-hub/
   ```

---

## 4. Configure Nginx

1. **Server block** `/etc/nginx/sites-available/ai-hub`
   ```nginx
   server {
     listen 80;
     listen [::]:80;
     server_name <your-domain> www.<your-domain>;

     root /var/www/ai-hub;
     index index.html;

     access_log /var/log/nginx/ai-hub.access.log;
     error_log  /var/log/nginx/ai-hub.error.log;

     location / {
       try_files $uri $uri/ =404;
     }
   }
   ```
2. **Enable config**
   ```bash
   ln -s /etc/nginx/sites-available/ai-hub /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   ```

---

## 5. Domain & DNS

1. Purchase/manage domain (production uses `aihublabs.xyz` from Namecheap).
2. At registrar, create A record(s):
   - `@` → droplet IPv4
   - `www` → droplet IPv4 (or CNAME to root)
3. Wait for propagation (`dig a aihublabs.xyz +short`).

---

## 6. HTTPS (Let’s Encrypt)

1. Install Certbot:
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```
2. Issue certificate (replace domain if reusing guide):
   ```bash
   certbot --nginx -d aihublabs.xyz -d www.aihublabs.xyz
   ```
3. Test auto-renewal:
   ```bash
   certbot renew --dry-run
   ```

---

## 7. Deploy Updates

Whenever repo changes:

```bash
ssh deploy@<domain>
cd /var/www/ai-hub
git pull origin main
sudo systemctl reload nginx   # static site but good habit
```

If you build locally first, use `rsync -avz ./ deploy@domain:/var/www/ai-hub/`.

---

## 8. Verifications

1. `curl -I https://<domain>` – expect `200 OK`.
2. Browser check: `Ctrl+K` palette, JSON-fed panels, outbound links.
3. Mobile viewport test (DevTools responsive mode).
4. Lighthouse / PageSpeed smoke test.

Document screenshots and terminal logs for submission.

---

## 9. Maintenance Playbook

- **Backups**: snapshot droplet after major releases.
- **Security**: `apt upgrade` monthly, rotate SSH keys, monitor `ufw`.
- **Data refresh**: edit `/var/www/ai-hub/data/*.json`, commit, redeploy.
- **Monitoring**: optional `doctl monitor` or UptimeKuma ping.

---

## 10. Submission Checklist

- [ ] Repo updated & tagged.
- [ ] README links to live domain + this deployment guide.
- [ ] Screenshots + screencast (if required) showing site + droplet console.
- [ ] Video walkthrough stored at https://drive.google.com/drive/folders/15cg6juePReh-uyDSP8ROw4JFEZn_kXY8?usp=sharing (update link if relocated).
- [ ] Server documentation committed (this file).
- [ ] Backup snapshot noted in report.

> Keep all shell commands and rationale in your assignment report so markers can trace what you built versus what was automated.
