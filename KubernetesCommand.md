# Commands

## Apply

```bash
# App
kubectl apply -f ./app-configmap.yaml

# PostgreSQL
kubectl apply -f ./postgresql/postgresql-pvc.yaml
kubectl apply -f ./postgresql/postgresql-deployment.yaml
kubectl apply -f ./postgresql/postgresql-service.yaml

# RustFS
kubectl apply -f ./rustfs/rustfs-pvc.yaml
kubectl apply -f ./rustfs/rustfs-deployment.yaml
kubectl apply -f ./rustfs/rustfs-service.yaml

# Redis
kubectl apply -f ./redis/redis-deployment.yaml
kubectl apply -f ./redis/redis-service.yaml

# Nest.js
kubectl apply -f ./nest/nest-service.yaml

# FastAPI
kubectl apply -f ./fastapi/fastapi-service.yaml

# Next.js
kubectl apply -f ./next/next-service.yaml

# Nginx
kubectl apply -f ./nginx/nginx-configmap.yaml
kubectl apply -f ./nginx/nginx-deployment.yaml
kubectl apply -f ./nginx/nginx-service.yaml
```

### Production

```bash
# App
kubectl apply -f ./app-secret.yaml

# Nest
kubectl apply -f ./nest/nest-deployment.yaml

# FastAPI
kubectl apply -f ./fastapi/fastapi-deployment.yaml

# Next
kubectl apply -f ./next/next-deployment.yaml
```

### Test

```bash
# App
kubectl apply -f ./app-secret-test.yaml

# Nest
kubectl apply -f ./nest/nest-deployment-test.yaml

# FastAPI
kubectl apply -f ./fastapi/fastapi-deployment-test.yaml

# Next
kubectl apply -f ./next/next-deployment-test.yaml
```

## Restart

```bash
# Dashboard
kubectl rollout restart deployment -n kubernetes-dashboard

# PostgreSQL
kubectl rollout restart deployment postgresql-deployment

# RustFS
kubectl rollout restart deployment rustfs-deployment

# Redis
kubectl rollout restart deployment redis-deployment

# Nest.js
kubectl rollout restart deployment nest-deployment

# FastAPI
kubectl rollout restart deployment fastapi-deployment

# Next.js
kubectl rollout restart deployment next-deployment

# Nginx
kubectl rollout restart deployment nginx-deployment
```
