FROM node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        openjdk-17-jdk-headless \
        python3 \
        ripgrep \
        sudo \
        tmux \
        unzip \
    && rm -rf /var/lib/apt/lists/*

RUN id -u ubuntu >/dev/null 2>&1 || useradd -m -s /bin/bash ubuntu \
    && usermod -aG sudo ubuntu \
    && echo "ubuntu ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ubuntu

ARG ANDROID_TOOLS_VERSION=15859902
ARG ANDROID_TOOLS_SHA256=4e4c464f145a7512b57d088ac6c278c03c9eea610886b35a5e0804e74eedf583

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools"

RUN mkdir -p "${ANDROID_SDK_ROOT}/cmdline-tools" \
    && curl --retry 4 --retry-delay 3 -fsSL \
        "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_TOOLS_VERSION}_latest.zip" \
        -o /tmp/android-command-line-tools.zip \
    && echo "${ANDROID_TOOLS_SHA256}  /tmp/android-command-line-tools.zip" | sha256sum -c - \
    && unzip -q /tmp/android-command-line-tools.zip -d /tmp/android-command-line-tools \
    && mv /tmp/android-command-line-tools/cmdline-tools \
        "${ANDROID_SDK_ROOT}/cmdline-tools/latest" \
    && yes | sdkmanager --sdk_root="${ANDROID_SDK_ROOT}" --licenses >/dev/null \
    && sdkmanager --sdk_root="${ANDROID_SDK_ROOT}" \
        "platform-tools" \
        "platforms;android-35" \
        "build-tools;34.0.0" \
        "build-tools;35.0.0" \
    && rm -rf /tmp/android-command-line-tools* \
    && chown -R ubuntu:ubuntu "${ANDROID_SDK_ROOT}"

USER ubuntu
WORKDIR /workspace
