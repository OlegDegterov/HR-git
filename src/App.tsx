import React, {useEffect, useState} from 'react';
import s from './App.module.css';
import axios from "axios";

type SearchUserType = {
    login: string,
    id: number
}
type SearchResult = {
    items: SearchUserType[]
}
type UserType = {
    login:string,
    id: number,
    avatar_url: string,
    followers: number
}

type SearchPropsType = {
    value: string,
    onSubmit: (fixedValue:string)=> void
}
export const Search = (props:SearchPropsType) => {
    //State для хранения даных из input; props.value - setaем в state значение которое прийдет от родителя
    const [tempSearch, setTempSearch] = useState(props.value)
    //синхронизируем значение(value) input. Передаем приходящие props setTempSearch и при изменении props.value
    // срабатывает useEffect  и set новый state вследствии чего перерисовывается компонент  => в input
    //появляется новое значение
    useEffect(()=>{
        setTempSearch(props.value)
    },[props.value])
    return (
        <div className={s.input}>
            <div>
                <input
                    placeholder="Insert chennal"
                    type="text"
                    //передаем input value равное tempSearch,
                    // первый шаг для того чтобы сделать его контролируемым элементом
                    value={tempSearch}
                    //вышаем на input событие onChange чтобы при изменении setTempSearch изменялся state
                    onChange={(event)=>setTempSearch(event.currentTarget.value)}
                />
            </div>
            <div>
                <button
                    // При нажатии на кнопку менять state, который является зависимостью useEffect
                    // после чего отработает useEffect в котором запуститься sideEffect (запрос на API)
                    onClick={()=>{
                        /*fetchData(tempSearch)*/
                        //при нажатии на кнопку берем данные из input и передаем их в state
                        //после чего useEffect регистрирует изменение зависимости searchTerm
                        //и запускает  fetchData(tempSearch)- которая делает запрос к API и сетает
                        // setUsers в state, которые при изменении запускает render который перерисовывает
                        //приложение методом массива map
                        //заменяем setSearchTerm(tempSearch) на props ф-цию callback  из родителя props.onSubmit(tempSearch)
                        /* setSearchTerm(tempSearch)*/
                        props.onSubmit(tempSearch)
                    }}
                >Search</button>
            </div>
        </div>
    )
}

type UsersListPropsType = {
    term:string,
    selecledUser: SearchUserType|null,
    onUserSelect: (user: SearchUserType)=>void
}
export const UsersList = (props:UsersListPropsType) => {
    //State для хранения users которые пришли от API
    const [users, setUsers] = useState<SearchUserType[]>([])
    //sync users - синхронизация (загрузка пользователей из api)
    useEffect(()=>{
        console.log('SYNC USERS')
        //tempSearch или searchTerm 54:07/ searchTerm т.к. при нажатии button изменяется  searchTerm
        // который получает значение tempSearch переданное inputом
        //передаем в поисковую строку типизированный проп props.term, со строкой из input
        axios.get<SearchResult>(`https://api.github.com/search/users?q=${props.term}`)
            .then (responce => {
                setUsers(responce.data.items)
            })
        /*fetchData(tempSearch)*/
        //типизируем get запрос укзываем что его результатом будет SearchResult = items: SearchUserType[]
        /*axios.get<SearchResult>('https://api.github.com/search/users?q=it-kamasutra')
            .then (responce => {
                setUsers(responce.data.items)
            })*/
        //синхронизация зависит от изменения tempSearch в state, ввели новые данные в input сработал useEffect
        //при каждом вводе нового символа срабатывает useEffect в котором направляется запрос к API
        //после чего приходят новые user изменяется state и происходит их отрисовка
        //добавляем зависимость props.term в useEffect, при изменении prop нажатии на кнопку Search
        // prop передается компоненту list для отрисовки
    },[props.term])
    return (
            <ul>
                {users
                    .map((item) => <li
                        className={props.selecledUser === item ? s.selected : ''}
                        key={item.id}
                        onClick={
                            ()=> {
                                props.onUserSelect(item)
                                //document.title = item
                            }
                        }
                    >
                        {item.login}
                    </li>)
                }
            </ul>
    )

}

type TimerProps = {
    seconds:number,
    onChange: (actualSeconds:number)=>void,
    //строка для зависимости таймера
    timerKey: string
}
const startTierSeconds = 10

export function Timer(props: TimerProps) {
    //Timer при первой отрисовке фиксирует значение  60;
    // фиксируется useEffect но не запкскается;
    //далее render;
    //далее запускается useEffect
    //Создается функция ()=>{
    //             setseconds(seconds-1)
    //             console.log('TICK')
    //         },1000)
    //Которая при первом запуске берет из замыкания 60
    //Каждую секунду при запуске setInterval(()=>{
    //             setseconds(seconds-1)
    //             console.log('TICK')
    //         },1000)
    //seconds из замыкания берет 60
    const [seconds, setseconds] = useState(props.seconds)
    useEffect(() => {
        setseconds(props.seconds)
    }, [props.seconds])
    //Синронизация передачи данных (секунд) родительскому компоненту
    useEffect(() => {
        props.onChange(seconds)
    }, [seconds])

    useEffect(() => {

        const intervalId = setInterval(() => {
            // Плохое решение setseconds(seconds-1) т.к. 60 берется из замыкания  и не изменяется
            // лучше передать функцию которую вызовет React и передаст актуальное значение
            setseconds((prev) => prev - 1)
            console.log('TICK')
        }, 1000)
        //зачистка таймера, который не умирает после демонтирования компонента
        return () => {
            clearInterval(intervalId)
        }
    }, [props.timerKey])
    return (
        <div>
            {seconds}
        </div>
    )
}


type UserDetailsPropsType = {
    user: SearchUserType|null
}
export const UserDetails = (props:UserDetailsPropsType) =>{

    //State для хранения детальной информации user
    const [userDetails, setUserDetails] = useState<UserType|null>(null)
    //State для подсчета секунд
    const [seconds, setSeconds]=useState(startTierSeconds)

    //Показ деталей User
    useEffect(()=>{
        console.log('SYNC USERS DETAILS')
        if (!!props.user){
            //типизируем response как UserType
            axios.get<UserType>(`https://api.github.com/users/${props.user.login}`)
                .then (response => {
                    //важен порядок set т.к. сначало необходимо сбросить секунды а потом set детали юзера
                    //React  не собирает set  b потом их выполняет за 1 рендеринг,
                    // а поочередно выполняет два set и выполняет 2 рендеринга
                    setSeconds(startTierSeconds)
                    setUserDetails(response.data)
                })
        }
        // передаем зависимость для сихроназации при изменении selectedUser, при клике на узера из
        // списка посылаем запрос к API
    },[props.user])

    //Синхронизация при seconds = 0  userDetails=null и компонент UserDetail умирает
    useEffect(()=>{
        if(seconds<1) {
            setUserDetails(null)
        }
    },[seconds])

    return (
        <div>
            {userDetails &&
            <div>
                <div>
                    <Timer seconds={seconds} onChange={setSeconds} timerKey={userDetails.id.toString()}/>
                        {/*или onChange={(actualSeconds)=>{setSeconds(actualSeconds)} */}
                    {userDetails.login}
                </div>
                <div>

                    <img src={userDetails.avatar_url}/>
                    {userDetails.login}, followers: {userDetails.followers}
                </div>

            </div>
            }
        </div>
    )
}

function App() {
    const initaalSearchState = 'it-kamasutra'
    //State для отображения title
    const [selectedUser, setSelectedUser] = useState<SearchUserType|null>(null)
    /*//State для хранения даных из input
    const [tempSearch, setTempSearch] = useState('it-kamasutra')*/
    //State для загрузки пользователей после нажатия на кнопку Search
    const [searchTerm, setSearchTerm] = useState(initaalSearchState)


    //sync  title -  синхронизация title
    useEffect(()=>{
        console.log('SYNC TITLE')
        if (selectedUser) {
            document.title = selectedUser.login
        }
    },[selectedUser])





    /*let fetchData = (term:string) =>{
        axios.get<SearchResult>(`https://api.github.com/search/users?q=${term}`)
            .then (responce => {
                setUsers(responce.data.items)
            })
    }*/

    //Передаем дочернему компоненту Search value = пустая строка, и callback функцию
    // которую вызывает Search при нажатии на button и передает значение  state tempSearch
    // введенное в input
    return (
        <div className={s.wrapper}>
            <div>
                <div>
                    <Search value={searchTerm} onSubmit={(value:string)=>{setSearchTerm(value)}}/>
                    <button onClick={()=>{setSearchTerm(initaalSearchState)}}>Reset</button>
                </div>
                <div>
                    <UsersList
                        term={searchTerm}
                        selecledUser={selectedUser}
                        //onUserSelect={(user)=>{setSelectedUser(user)}}
                        //т.к. setSelectedUser тоже callback фкнкция то тожно передать только ее
                        onUserSelect={setSelectedUser}
                    />
                </div>
            </div>
            <div>

                <UserDetails user={selectedUser}/>

            </div>
        </div>
    );
}

export default App;

