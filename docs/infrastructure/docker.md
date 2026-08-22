# Docker at Open Food Facts


## Technology stack

See also: [Continuous Integration and Continuous Delivery](cicd.md#technology-stack)

### Docker (*idempotency*)

The process of dockerizing applications is an important step toward achieving a modern, reliable Continuous Integration and Continuous Delivery process.

**Dockerization** avoids common pitfalls in deployment processes, such as having to write idempotent deployment scripts to deploy an application. A Docker container build can be run many times, producing the same resulting image each time.

Most of Open Food Facts git repositories have a `Dockerfile` that is used both to test changes locally and to ease automated testing and automated deployments through **idempotency** (also known as repeatability, or the ability to re-run a deployment multiple times without problems).


### Docker Compose (*orchestration*)

We use `docker-compose` to deploy our applications to our servers. It is a simple **orchestrator** that can deploy to a single machine at once.

An alternative like `docker swarm` or `kubernetes` could be considered in the future to deploy to multiple machines at scale, but it currently does not make much sense considering the small number of servers used to run Open Food Facts.

### Env file (*secret management*)

Every Open Food Facts repository has a `.env` file that contains the secrets needed by the application to run properly. The `.env` file is loaded by the `docker-compose` commands.

The default `.env` file in the repository is ready for local development and should rarely be modified.

In pre-production and production, the `.env` file is populated by GitHub Actions (using GitHub environment secrets) before deploying to the target environment.

**Warnings:**
* The default `.env` file should rarely change. If you need a different environment locally, create a new env file (for example, `.env.test`) and set `ENV_FILE=.env.test` before running the `Makefile` commands.
* Do not commit your env files to the repositories.
* You may use `direnv` to override some variables on a folder basis. See the [how-to guide for openfoodfacts-server](https://github.com/openfoodfacts/openfoodfacts-server/blob/main/docs/how-to-guides/use-direnv.md).


## Best practices for Docker containers

Here are some important rules. This document also explains why we follow these rules.  
From time to time, you might have good reasons to bend or break them, but only do so when necessary.  
These rules also enable a consistent experience across projects.


### Images

* If possible, use an official image. If you use another image, take a look at how it is built.  
  It is important to be future-proof and to rely on a solid base image.

* We try to favor images based on Debian. If really needed, you can use Arch or another distribution.  
  This helps keep environments consistent and manageable for administrators and developers when debugging images.


### Enable configuration through environment variables

We want to be able to run the same project multiple times on the same machine or server.  
To achieve this, we need to ensure that the docker-compose project is configurable.

There are two mechanisms to configure docker-compose:
- Docker Compose file composition, used for structural changes
- `.env`, which is the preferred way to change configuration (though it cannot solve everything)

* Avoid overly generic service names. For example, instead of `postgresql`, use `myproject_db`.
* Every public network should have a configurable name to allow running the project multiple times and to enable connections between docker-compose projects.
* Every exposed port should be configurable through environment variables.
  This allows running multiple instances of the same project and limits exposure to localhost during development.
* Never use `container_name`; let docker-compose generate container names automatically.
* Never use static names for volumes; let docker-compose add a prefix automatically.
* Try to stick to the default network and set up a network with a configurable name for exchanges with services from other projects.
* The `restart` directive should always be configurable.
  While automatic restarts are desirable in production, they should be disabled on development machines.
* Always prefer production-safe defaults.
  For example, it is better to expose services only to localhost.
  If a variable is missing in production, it should never cause a disaster.


### Development configuration

The `docker-compose.yml` file should be as close as possible to the production setup.

Put development-specific configurations in a `docker/dev.yml` file.

* The build section should only be present in the development Docker Compose configuration.
* Use `USER_UID` and `USER_GID` parameters to align the Docker user with the host user.
  This avoids file permission issues.
* Bind-mount the code to make development easier.
* Make it possible to connect projects together in development as they would be in production.
  This enables manual integration testing across projects.


### Production configuration

This section refers to production, but staging environments should be as close to production as possible.

* There should be no build step in production; containers should be defined by their images.
  This allows easy redeployment relying only on container registries.
* Every volume containing production data should be external to avoid data loss when running `docker-compose down -v`.
  The Makefile should include a `create_external_volumes` target.
* Shared network names should include a prefix reflecting the environment, such as `staging` or `prod`.
* `COMPOSE_PROJECT_NAME` should follow the format `<project_name>_<environment>`, for example `po_staging` or `po_prod`.

See also: https://github.com/openfoodfacts/openfoodfacts-infrastructure/issues/146


### Security

* Avoid using root in Docker images whenever possible.
  It is acceptable if root is only used to start a service that immediately drops privileges.
  This is especially important for containers that include code or files modified by developers during development.
* Expose services only to localhost whenever possible.
  Only expose them publicly when strictly necessary.
* Be aware that Docker uses its own iptables rules.
  Blocking INPUT or OUTPUT rules may not apply to Docker-exposed ports.
  Instead, add rules to the `DOCKER-USER` chain.
