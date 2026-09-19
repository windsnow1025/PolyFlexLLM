# K3S

## Install K3S

1. Install K3S
  ```bash
  curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--service-node-port-range=30000-39001 --disable=traefik" sh -
  ```

2. Verify Installation
  ```bash
  sudo k3s kubectl get node
  ```

3. Copy Kubernetes Config
  ```bash
  cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
  ```

## Kubernetes Dashboard

1. Install Dependencies
  ```bash
  apt install gpg
  ```

2. Debian Install Helm
  ```bash
  HELM_BUILDKITE_APT_KEY_ID="DDF78C3E6EBB2D2CC223C95C62BA89D07698DBC6"
  
  sudo apt-get install curl gpg apt-transport-https --yes
  
  curl -fsSL https://packages.buildkite.com/helm-linux/helm-debian/gpgkey > "${TMPDIR:-/tmp}/helm.gpg"
  
  # Ensure that the key ID matches to prevent a repository compromise from establishing an attacker controlled key
  if [ "$(gpg --show-keys --with-colons "${TMPDIR:-/tmp}/helm.gpg" | awk -F: '$1 == "fpr" {print $10}' | head -n 1)" != "${HELM_BUILDKITE_APT_KEY_ID}" ]; then echo "ERROR: Unexpected Helm APT key ID: potential key compromise"; exit 1; fi
  
  cat "${TMPDIR:-/tmp}/helm.gpg" | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
  echo "deb [signed-by=/usr/share/keyrings/helm.gpg] https://packages.buildkite.com/helm-linux/helm-debian/any/ any main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
  
  sudo apt-get update
  sudo apt-get install helm
  ```

3. Deploy Dashboard
  ```bash
  # first add our custom repo to your local helm repositories
  helm repo add headlamp https://kubernetes-sigs.github.io/headlamp/
  
  # install headlamp by setting your values directly
  helm install my-headlamp headlamp/headlamp --namespace kube-system --set config.baseURL=/kubernetes
  ```

4. Remote Access (NodePort)
  ```bash
  kubectl apply -f ./dashboard/dashboard-service.yaml
  ```
  Test: `curl http://localhost:34466/kubernetes/`

5. Create admin-user
  ```bash
  kubectl apply -f ./dashboard/dashboard-serviceaccount.yaml
  kubectl apply -f ./dashboard/dashboard-clusterrolebinding.yaml
  kubectl apply -f ./dashboard/dashboard-secret-public.yaml
  ```

6. Get a long-lived Bearer Token
  ```bash
  kubectl get secret admin-user -n kube-system -o jsonpath={".data.token"} | base64 -d
  ```

## Private Docker Registry (Optional)

1. Create Secret `docker-registry`
  ```bash
  kubectl create secret docker-registry regcred [-n <namespace>] \
    --docker-server=https://index.docker.io/v1/ \
    --docker-username='<docker-username>' \
    --docker-password='<docker-password>' \
    --docker-email='<email>'
  ```
