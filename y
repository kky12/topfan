version = 0.1
[y]
[y.deploy]
[y.deploy.parameters]
stack_name = "topfanslite"
s3_bucket = "aws-sam-cli-managed-default-samclisourcebucket-1ps2xsyf04nzo"
s3_prefix = "topfanslite"
region = "us-east-1"
confirm_changeset = true
capabilities = "CAPABILITY_IAM"
disable_rollback = true
parameter_overrides = "StageName=\"Prod\""
image_repositories = []

[default]
[default.deploy]
[default.deploy.parameters]
stack_name = "Topfan-Lite-Dev"
s3_bucket = "aws-sam-cli-managed-default-samclisourcebucket-1ps2xsyf04nzo"
s3_prefix = "Topfan-Lite-Dev"
region = "us-east-1"
confirm_changeset = true
capabilities = "CAPABILITY_IAM"
disable_rollback = true
parameter_overrides = "StageName=\"Prod\""
image_repositories = []
