FROM nginx:alpine

COPY dist /opt/nextgenui
COPY scripts/nginx.conf /etc/nginx/

WORKDIR /opt/nextgenui

# for on-prem
RUN addgroup -S 101 && adduser -S 101 -G 101
RUN chown -R 101:101 /opt/ /tmp
RUN chmod 700 -R /opt
RUN chmod 700 -R /tmp
USER 101
# end on-prem


EXPOSE 8080

CMD sed -i "s|<\!-- apiurl -->|<script>window.apiUrl = '$API_URL'</script>|" index.html && \
    nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
