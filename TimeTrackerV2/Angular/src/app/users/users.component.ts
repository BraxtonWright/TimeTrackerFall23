import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
    users: Array<any> = [];

    constructor(
        private http: HttpClient,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadUsers(this.users);
    }

    public pageTitle = 'TimeTrackerV2 | Users'

    loadUsers(users: Array<object>) {
        this.http.get("http://localhost:8080/api/Users").subscribe((data: any) => {
            for (let i = 0; i < data.length; i++) {
                users.push({
                    userID: data[i].userID,
                    name: data[i].firstName + " " + data[i].lastName,
                    username: data[i].username,
                    isActive: data[i].isActive,
                    type: data[i].type
                });
            }
        });
    }

    navToResetPassword(tag: any, body: any) {
        let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.router.navigate(['resetpassword'], { queryParams: user })
    }

    // Normally, we would want to have the argument be of type 'object' instead of 'any'. However if the type is 'object', we get an error saying "Property 'propertyName' doesn't exist on type 'object'"
    DeleteUser(userInfo: any) {
        console.log("Navigate to page to confirm deletion of user with userID: " + userInfo.userID);

        // Syntax for the below code was found here https://stackoverflow.com/questions/9334636/how-to-create-a-dialog-with-ok-and-cancel-options
        const response = confirm(`WARNING:  Deleting the user "${userInfo.name}" is irreversible.\n\nIf you continue with this process, the user will be deleted.\nDo you wish to continue?`);
        // The user wants to delete the user
        if (response) {
            // Make a body variable for the http.delete request so we can safely delete user instead of passing the variable in the URL.  https://stackoverflow.com/a/40857437
            let requestBody = {
                userID: userInfo.userID
            };

            // This http delete request will delete the account attache attached to the user with the userID as specified in the body of the request, it will then remove the user from the local list of users so that the UI and the DB match.
            // This code is also formatted so that it will handle any 500 status codes the server sends here and it will display the message to the user.  Source for this code format with some alterations https://stackoverflow.com/a/52610468
            this.http.delete("http://localhost:8080/api/deleteAccount", { body: requestBody }).subscribe((res: any) => {
                // This set of code will have the UI automatically updated because the content's of the variable "users" has been changed https://www.tutorialspoint.com/how-to-delete-a-row-from-table-using-angularjs
                let index: number = this.users.indexOf(userInfo);
                this.users.splice(index, 1);
                // Now it will notify the user that the user has been deleted
                this.ShowMessage(res.message);
            },
            err => {
                this.ShowMessage(err.error.message);
            });
        }
        // The user doesn't want to delete the user (for debugging only)
        else {
            console.log("User not deleted");
        }
    }

    // Open an alert window with the supplied message
    ShowMessage(message: string) {
        alert(message);
    }
}