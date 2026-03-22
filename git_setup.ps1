$git = "C:\Program Files\Git\cmd\git.exe"
& $git config user.email "parasnath215@github.com"
& $git config user.name "parasnath215"
& $git commit -m "Initialize project for Render deployment"
& $git branch -M main
# We may have already added the remote, so ignore errors on add and just set it
& $git remote remove origin
& $git remote add origin https://github.com/parasnath215/Swastik.git
& $git push -u origin main
