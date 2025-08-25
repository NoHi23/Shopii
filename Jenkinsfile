pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        BACKEND_DIR = 'back-end'
        FRONTEND_DIR = 'front-end'
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool name: 'NodeJS-18', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm test -- --watchAll=false --coverage'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npx eslint . --ext .js || echo "ESLint not configured"'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npx eslint . --ext .js,.jsx || echo "ESLint not configured"'
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    dir("${BACKEND_DIR}") {
                        sh 'npm audit --audit-level=moderate || true'
                    }
                    dir("${FRONTEND_DIR}") {
                        sh 'npm audit --audit-level=moderate || true'
                    }
                }
            }
        }
        
        stage('Build Applications') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'npm run build || echo "No build script found"'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            script {
                                docker.build("${DOCKER_REGISTRY}/shopii-backend:${IMAGE_TAG}")
                                docker.build("${DOCKER_REGISTRY}/shopii-backend:latest")
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            script {
                                docker.build("${DOCKER_REGISTRY}/shopii-frontend:${IMAGE_TAG}")
                                docker.build("${DOCKER_REGISTRY}/shopii-frontend:latest")
                            }
                        }
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        sh "docker push ${DOCKER_REGISTRY}/shopii-backend:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/shopii-backend:latest"
                        sh "docker push ${DOCKER_REGISTRY}/shopii-frontend:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/shopii-frontend:latest"
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    // Deploy to staging environment
                    sh '''
                        echo "Deploying to staging..."
                        # Add your staging deployment commands here
                        # Example: kubectl apply -f k8s/staging/
                        # Example: docker-compose -f docker-compose.staging.yml up -d
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Deploy to production environment
                    sh '''
                        echo "Deploying to production..."
                        # Add your production deployment commands here
                        # Example: kubectl apply -f k8s/production/
                        # Example: docker-compose -f docker-compose.production.yml up -d
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Cleanup workspace
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            // Send notification
            emailext (
                subject: "Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline failed at stage: ${currentBuild.description}",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }
    }
}
