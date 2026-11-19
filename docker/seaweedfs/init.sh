#!/bin/sh
# Creates the two buckets and their CORS rules (idempotent). Runs once, as the bootstrap identity.
# The private bucket takes browser PUTs from the CRM; the public one is read by anonymous users
# (granted by the "anonymous" identity of s3.json), which emulates media.<domain> behind the CDN.
set -eu

S3_URL="${S3_URL:-http://s3:9000}"
CRM_ORIGIN="${CRM_ORIGIN:-http://localhost:3000}"

s3() {
  curl -fsS --aws-sigv4 "aws:amz:us-east-1:s3" \
    --user "ancla-bootstrap-key:ancla-bootstrap-secret" "$@"
}

cors_rule() {
  cat <<XML
<CORSConfiguration><CORSRule><AllowedOrigin>${CRM_ORIGIN}</AllowedOrigin><AllowedMethod>PUT</AllowedMethod><AllowedMethod>GET</AllowedMethod><AllowedMethod>HEAD</AllowedMethod><AllowedHeader>*</AllowedHeader><ExposeHeader>ETag</ExposeHeader></CORSRule></CORSConfiguration>
XML
}

for bucket in ancla-private ancla-public; do
  s3 -o /dev/null -X PUT "${S3_URL}/${bucket}"
  cors_rule | s3 -o /dev/null -X PUT --data-binary @- "${S3_URL}/${bucket}?cors"
  echo "bucket ${bucket} ready"
done
