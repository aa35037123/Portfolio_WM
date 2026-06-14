IMAGE_NAME ?= portfolio-wm-build
SERVICE ?= web

.PHONY: default build run preview stop

default: all

build:
	docker build --target build -t $(IMAGE_NAME) .

run:
	docker compose up $(SERVICE)
all:
	docker compose up --build $(SERVICE)
preview:
	docker compose up --build preview

stop:
	docker compose down
