# Copyright 2021 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

mkdir -p certificates
openssl req -x509 -newkey rsa:4096 -keyout certificates/localhost-key.pem -out certificates/localhost.pem -days 365 -nodes -subj '/C=US'
