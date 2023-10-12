# Use a lightweight image of Nginx
FROM nginx:mainline-alpine3.18-slim

# Copy the static content to the container
COPY ./ootd /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
