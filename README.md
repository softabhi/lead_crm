For laravel backend setup follow below given step.
composer install
php artisan key:generate.

Configure the database:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crm
DB_USERNAME=root
DB_PASSWORD=


php artisan migrate

This creates the required database tables.

If seeders are available, run:

php artisan db:seed



This project uses Laravel Sanctum for API authentication.

If Sanctum has not already been installed in the project, run:

php artisan install:api

Then run:

php artisan migrate

If Sanctum is already included in the repository and the required migration has already been created, you do not need to install it again.

Note: By default if any user submit enquiry ,then show admin create lead because that user not register in user table , It will update as requirment.
