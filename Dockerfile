FROM nginx:alpine

# Copier les fichiers du site web
COPY . /usr/share/nginx/html/

# Configurer Nginx pour les applications single-page
RUN echo '
server {
    listen       80;
    server_name  localhost;
    root   /usr/share/nginx/html;
    index  index.html;

    # Compression pour améliorer les performances
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    gzip_min_length 1000;

    # Mise en cache des assets statiques
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Gestion SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
' > /etc/nginx/conf.d/default.conf

# S'assurer que nginx s'exécute en avant-plan
CMD ["nginx", "-g", "daemon off;"]

# Exposer le port 80
EXPOSE 80

# Métadonnées
LABEL maintainer="kihw@mserv.wtf"
LABEL description="Tableau de bord pour mserv.wtf"
LABEL version="3.0.0"