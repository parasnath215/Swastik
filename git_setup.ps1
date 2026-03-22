$git = "C:\Program Files\Git\cmd\git.exe"
& $git init
& $git add .
& $git commit -m "Initialize project for Render deployment"
& $git branch -M main
& $git remote add origin https://github.com/parasnath215/Swastik.git
& $git push -u origin main
