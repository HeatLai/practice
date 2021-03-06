# 檢查IP
```
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis_1  
or  
docker inspect redis_1 | grep "IPAddress"  
```

# 檢查 container state
利用 python 的 json.tool 印出排版過的 json 
```
docker inspect -f '{{json .State}}' [container_name] | python -m json.tool
docker inspect -f '{{json .State}}' redis_1 | python -m json.tool
```

# 建立叢集 全部節點都是 Master
```
redis-trib create [host:port] [host:port] [...]
redis-trib create 172.19.0.11:6379 172.19.0.12:6379 172.19.0.13:6379 \
172.19.0.14:6379 172.19.0.15:6379 172.19.0.16:6379
```

# 建立叢集 Master-Slave
--replicas [int] 每個Master 要帶 幾個Slave
```
redis-trib create --replicas [int] [host:port] [host:port] [...]
redis-trib create --replicas 1 172.19.0.11:6379 172.19.0.12:6379 172.19.0.13:6379 \
172.19.0.14:6379 172.19.0.15:6379 172.19.0.16:6379
```

# 檢查叢集節點主從狀態
```
redis-trib check [host:port]
redis-trib check 172.19.0.11:6379
or
redis-cli cluster nodes
```

# 新增節點
```
redis-trib add-node [新節點] [叢集內任一節點]
redis-trib add-node 172.19.0.17:6379 172.19.0.11:6379
```

# 檢查 slot & key 分布

```
redis-trib info [host:port]
redis-trib info 172.19.0.11:6379
```