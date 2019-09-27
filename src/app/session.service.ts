import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient) { }

  addTask(task: any):Observable<any> {

      return this.http.post('http://localhost:8080/fsd/tasks',task);
  }

  getUsers():Observable<any> {
    //return this.http.get('./assets/users.json');
    return this.http.get('http://localhost:8080/fsd/users');
  }
  addUser(user: any):Observable<any> {
    console.log(user);
   return this.http.post("http://localhost:8080/fsd/users",user);
    //return of([{user}]);
  }

  updateUser(user: any):Observable<any> {
     console.log(user);
     let url = `http://localhost:8080/fsd/users/${user.user_Id}`;
    return this.http.put(url,user);
     //return of([{user}]);
   }

  deleteUser(user: any) {
  let url = `http://localhost:8080/fsd/users/${user.user_Id}`;
    return this.http.delete(url);
  }

  getProjectsList(): Observable<any> {
    return this.http.get('http://localhost:8080/fsd/projects');
  }

  addProject(projects: any): Observable<any> {
    console.log(projects);
    return this.http.post("http://localhost:8080/fsd/projects",projects);

  }

  getTaskLists(): Observable<any> {
    return this.http.get('./assets/tasks.json');
  }

  managerSearch(term:any): Observable<any> {
    return this.http.get('http://localhost:8080/fsd/users');
  }
}
