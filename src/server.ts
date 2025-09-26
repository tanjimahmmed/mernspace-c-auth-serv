function welcome(name: string) {
    console.log('hello');
    console.log('hi');

    const user = {
        name: 'Tanjim',
    };

    const fname = user.name;

    return name + fname;
}

welcome('Tanjim');
