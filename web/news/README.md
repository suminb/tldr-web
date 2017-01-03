When you try to build `psycopg2` on Mac, you may get an error message like the
following:

    ld: library not found for -lssl

In order to circumvent this problem, set `LDFLAGS` environment variable.

    env LDFLAGS="-I/usr/local/opt/openssl/include -L/usr/local/opt/openssl/lib" pip install psycopg2
