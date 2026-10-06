// Production deploys run only when DEPLOY_ENABLED=true and the branch is PRODUCTION_BRANCH (default: main).
// Registry and VPS values come from the Jenkins job environment. Credentials stay in the Jenkins credential store.

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        PRODUCTION_BRANCH = "${env.PRODUCTION_BRANCH ?: 'main'}"
        BACKEND_IMAGE_NAME = "${env.BACKEND_IMAGE_NAME ?: 'cyrohost-backend'}"
        FRONTEND_IMAGE_NAME = "${env.FRONTEND_IMAGE_NAME ?: 'cyrohost-frontend'}"
        VPS_DEPLOY_PATH = "${env.VPS_DEPLOY_PATH ?: '/opt/cyrohost'}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect environment') {
            steps {
                script {
                    def head = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    if (head == 'HEAD') {
                        def fromEnv = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''
                        env.RESOLVED_BRANCH = fromEnv.replaceFirst('^origin/', '')
                    } else {
                        env.RESOLVED_BRANCH = head
                    }
                    env.RESOLVED_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    if (!env.RESOLVED_BRANCH?.trim()) {
                        error('Could not determine the git branch. Configure a multibranch job or set BRANCH_NAME.')
                    }
                    echo "Branch ${env.RESOLVED_BRANCH}, commit ${env.RESOLVED_COMMIT}."
                    if (env.RESOLVED_BRANCH != env.PRODUCTION_BRANCH) {
                        echo "Deployment is limited to ${env.PRODUCTION_BRANCH}. This run will build and test only."
                    }
                }
                sh '''
                    set -eu
                    if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
                      export PATH="$JAVA_HOME/bin:$PATH"
                    elif [ -x /usr/lib/jvm/java-21-openjdk-amd64/bin/java ]; then
                      export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
                      export PATH="$JAVA_HOME/bin:$PATH"
                    fi
                    java -version
                    version=$(java -version 2>&1 | sed -n 's/.*version "\\([^"]*\\).*/\\1/p' | head -n 1)
                    case "$version" in
                      21*) ;;
                      *) echo "Java 21 is required. Found $version." >&2; exit 1 ;;
                    esac
                    mvn -version
                    node -v
                    npm -v
                    docker version
                    docker compose version
                '''
            }
        }

        stage('Backend build') {
            steps {
                dir('backend') {
                    sh '''
                        set -eu
                        if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
                          export PATH="$JAVA_HOME/bin:$PATH"
                        elif [ -x /usr/lib/jvm/java-21-openjdk-amd64/bin/java ]; then
                          export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
                          export PATH="$JAVA_HOME/bin:$PATH"
                        fi
                        mvn -B -DskipTests package
                    '''
                }
            }
        }

        stage('Backend tests') {
            steps {
                dir('backend') {
                    sh '''
                        set -eu
                        if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
                          export PATH="$JAVA_HOME/bin:$PATH"
                        elif [ -x /usr/lib/jvm/java-21-openjdk-amd64/bin/java ]; then
                          export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
                          export PATH="$JAVA_HOME/bin:$PATH"
                        fi
                        mvn -B test
                    '''
                }
            }
        }

        stage('Frontend build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Frontend lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Docker backend image') {
            steps {
                sh '''
                    set -eu
                    docker build \
                      -f backend/Dockerfile \
                      -t "${BACKEND_IMAGE_NAME}:${RESOLVED_COMMIT}" \
                      -t "${BACKEND_IMAGE_NAME}:${BUILD_NUMBER}" \
                      backend
                '''
            }
        }

        stage('Docker frontend image') {
            steps {
                sh '''
                    set -eu
                    docker build \
                      -f Dockerfile \
                      --build-arg "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8080}" \
                      -t "${FRONTEND_IMAGE_NAME}:${RESOLVED_COMMIT}" \
                      -t "${FRONTEND_IMAGE_NAME}:${BUILD_NUMBER}" \
                      .
                '''
            }
        }

        stage('Validate images') {
            steps {
                sh '''
                    set -eu
                    docker image inspect "${BACKEND_IMAGE_NAME}:${RESOLVED_COMMIT}" >/dev/null
                    docker image inspect "${FRONTEND_IMAGE_NAME}:${RESOLVED_COMMIT}" >/dev/null
                    docker run --rm --entrypoint java "${BACKEND_IMAGE_NAME}:${RESOLVED_COMMIT}" -version
                    docker run --rm --entrypoint node "${FRONTEND_IMAGE_NAME}:${RESOLVED_COMMIT}" -e "process.exit(0)"
                    POSTGRES_PASSWORD=ci-check \
                    JWT_SECRET=ci-check-ci-check-ci-check-ci-check \
                    FRONTEND_ORIGIN=http://localhost:3000 \
                    PUBLIC_BASE_URL=http://localhost:8080 \
                    CYROHOST_BACKEND_IMAGE="${BACKEND_IMAGE_NAME}:${RESOLVED_COMMIT}" \
                    CYROHOST_FRONTEND_IMAGE="${FRONTEND_IMAGE_NAME}:${RESOLVED_COMMIT}" \
                    docker compose -f docker-compose.prod.yml config >/dev/null
                '''
            }
        }

        stage('Push images') {
            when {
                allOf {
                    environment name: 'DEPLOY_ENABLED', value: 'true'
                    expression { return env.RESOLVED_BRANCH == env.PRODUCTION_BRANCH }
                }
            }
            steps {
                script {
                    if (!env.DOCKER_REGISTRY?.trim() || !env.DOCKER_NAMESPACE?.trim()) {
                        error('Set DOCKER_REGISTRY and DOCKER_NAMESPACE before pushing images.')
                    }
                }
                withCredentials([usernamePassword(credentialsId: 'cyrohost-docker-registry', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh '''
                        set -eu
                        echo "$DOCKER_PASSWORD" | docker login "$DOCKER_REGISTRY" --username "$DOCKER_USER" --password-stdin
                        backend="${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE_NAME}"
                        frontend="${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE_NAME}"
                        docker tag "${BACKEND_IMAGE_NAME}:${RESOLVED_COMMIT}" "${backend}:${RESOLVED_COMMIT}"
                        docker tag "${BACKEND_IMAGE_NAME}:${BUILD_NUMBER}" "${backend}:${BUILD_NUMBER}"
                        docker tag "${FRONTEND_IMAGE_NAME}:${RESOLVED_COMMIT}" "${frontend}:${RESOLVED_COMMIT}"
                        docker tag "${FRONTEND_IMAGE_NAME}:${BUILD_NUMBER}" "${frontend}:${BUILD_NUMBER}"
                        docker push "${backend}:${RESOLVED_COMMIT}"
                        docker push "${backend}:${BUILD_NUMBER}"
                        docker push "${frontend}:${RESOLVED_COMMIT}"
                        docker push "${frontend}:${BUILD_NUMBER}"
                        docker logout "$DOCKER_REGISTRY" || true
                    '''
                }
            }
        }

        stage('Deploy') {
            when {
                allOf {
                    environment name: 'DEPLOY_ENABLED', value: 'true'
                    expression { return env.RESOLVED_BRANCH == env.PRODUCTION_BRANCH }
                }
            }
            steps {
                script {
                    if (!env.VPS_HOST?.trim() || !env.VPS_USER?.trim()) {
                        error('Set VPS_HOST and VPS_USER before deploying.')
                    }
                    if (!env.DOCKER_REGISTRY?.trim() || !env.DOCKER_NAMESPACE?.trim()) {
                        error('Set DOCKER_REGISTRY and DOCKER_NAMESPACE before deploying.')
                    }
                }
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'cyrohost-vps-ssh', keyFileVariable: 'SSH_KEY'),
                    file(credentialsId: 'cyrohost-vps-known-hosts', variable: 'KNOWN_HOSTS'),
                    usernamePassword(credentialsId: 'cyrohost-docker-registry', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')
                ]) {
                    sh '''
                        set -eu
                        backend="${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${BACKEND_IMAGE_NAME}:${RESOLVED_COMMIT}"
                        frontend="${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${FRONTEND_IMAGE_NAME}:${RESOLVED_COMMIT}"
                        target="$VPS_USER@$VPS_HOST"
                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$KNOWN_HOSTS" "$target" "mkdir -p '$VPS_DEPLOY_PATH/deploy'"
                        scp -i "$SSH_KEY" -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$KNOWN_HOSTS" docker-compose.prod.yml "$target:$VPS_DEPLOY_PATH/docker-compose.prod.yml"
                        scp -i "$SSH_KEY" -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$KNOWN_HOSTS" deploy/remote-up.sh "$target:$VPS_DEPLOY_PATH/deploy/remote-up.sh"
                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$KNOWN_HOSTS" "$target" "chmod 700 '$VPS_DEPLOY_PATH/deploy/remote-up.sh'"
                        printf '%s' "$DOCKER_PASSWORD" | ssh -i "$SSH_KEY" -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$KNOWN_HOSTS" "$target" "docker login '$DOCKER_REGISTRY' --username '$DOCKER_USER' --password-stdin"
                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$KNOWN_HOSTS" "$target" "sh '$VPS_DEPLOY_PATH/deploy/remote-up.sh' '$backend' '$frontend'"
                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$KNOWN_HOSTS" "$target" "docker logout '$DOCKER_REGISTRY'" || true
                    '''
                }
            }
        }

        stage('Health check') {
            when {
                allOf {
                    environment name: 'DEPLOY_ENABLED', value: 'true'
                    expression { return env.RESOLVED_BRANCH == env.PRODUCTION_BRANCH }
                }
            }
            steps {
                sh '''
                    set -eu
                    if [ -z "${PUBLIC_API_URL:-}" ] || [ -z "${PUBLIC_SITE_URL:-}" ]; then
                      echo "Remote health already passed. Set PUBLIC_API_URL and PUBLIC_SITE_URL to also check the public URLs."
                      exit 0
                    fi
                    curl -fsS "${PUBLIC_API_URL%/}/actuator/health/readiness"
                    curl -fsS "${PUBLIC_SITE_URL%/}/" >/dev/null
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker builder prune -f --filter until=168h || true
            '''
        }
    }
}
